import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { apiRequest, setAuthToken, removeAuthToken } from '../services/api';

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  authProvider?: string;
}

interface GmailLoginModalProps {
  visible: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogoutSuccess: () => void;
}

export const GmailLoginModal: React.FC<GmailLoginModalProps> = ({
  visible,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogoutSuccess
}) => {
  const [gmailAddress, setGmailAddress] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGmailLogin = async () => {
    if (!gmailAddress.trim()) {
      setErrorMsg('Please enter a valid Gmail address');
      return;
    }

    if (!gmailAddress.includes('@')) {
      setErrorMsg('Address must contain @gmail.com');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const formattedEmail = gmailAddress.trim().toLowerCase();
      const derivedName = displayName.trim() || formattedEmail.split('@')[0];

      const res = await apiRequest('/auth/google', 'POST', {
        email: formattedEmail,
        name: derivedName,
        googleId: `google_${Date.now()}`,
        picture: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedEmail)}`
      });

      if (res.success && res.token && res.user) {
        await setAuthToken(res.token);
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.message || 'Gmail login failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error during Google Authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await removeAuthToken();
    onLogoutSuccess();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.googleBadge}>
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.headerTitle}>GMAIL CLOUD BACKUP</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {currentUser ? (
            /* Logged In View */
            <View style={styles.loggedInContainer}>
              <View style={styles.profileBadge}>
                {currentUser.avatar ? (
                  <Image source={{ uri: currentUser.avatar }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarLetter}>
                      {(currentUser.name || currentUser.email)[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.profileMeta}>
                  <Text style={styles.profileName}>{currentUser.name || 'Winter Arc Achiever'}</Text>
                  <Text style={styles.profileEmail}>{currentUser.email}</Text>
                  <View style={styles.statusRow}>
                    <View style={styles.greenDot} />
                    <Text style={styles.statusText}>ALL RECORDS SYNCED TO THIS GMAIL</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.infoDesc}>
                Your monthly habit trackers, sleep matrices, and goal blueprints are safely backed up to MongoDB Atlas under your Gmail account.
              </Text>

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>LOGOUT / SWITCH GMAIL ACCOUNT</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Login Form View */
            <View style={styles.loginContainer}>
              <Text style={styles.subTitle}>SYNC & ACCESS YOUR RECORDS ANYWHERE</Text>
              <Text style={styles.infoDesc}>
                Enter your Gmail account to isolate and permanently store your monthly habit sheets, sleep logs, and goal details in MongoDB Atlas.
              </Text>

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              <Text style={styles.fieldLabel}>YOUR GMAIL ADDRESS</Text>
              <TextInput
                style={styles.textInput}
                placeholder="example@gmail.com"
                placeholderTextColor="#666"
                value={gmailAddress}
                onChangeText={setGmailAddress}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>DISPLAY NAME (OPTIONAL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Srikrishna"
                placeholderTextColor="#666"
                value={displayName}
                onChangeText={setDisplayName}
              />

              <TouchableOpacity
                style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                onPress={handleGmailLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <View style={styles.btnRow}>
                    <Text style={styles.googleGBtn}>G</Text>
                    <Text style={styles.loginBtnText}>CONNECT WITH GMAIL</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#090A0C',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    padding: SPACING.lg,
    boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1D24',
    paddingBottom: SPACING.xs
  },
  googleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  googleG: {
    fontSize: 22,
    fontWeight: '900',
    color: '#4285F4'
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1.5
  },
  closeBtn: {
    padding: 6
  },
  closeBtnText: {
    color: '#888',
    fontSize: 18,
    fontWeight: '700'
  },
  subTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.2,
    marginBottom: 6
  },
  infoDesc: {
    fontSize: 13,
    color: '#AAA',
    lineHeight: 18,
    marginBottom: SPACING.md
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: SPACING.sm
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 4
  },
  textInput: {
    backgroundColor: '#12141A',
    borderWidth: 1,
    borderColor: '#2A2D36',
    borderRadius: 8,
    color: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: SPACING.md
  },
  loginBtn: {
    backgroundColor: '#EA4335',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6
  },
  loginBtnDisabled: {
    opacity: 0.6
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  googleGBtn: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF'
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1
  },
  loggedInContainer: {
    paddingVertical: SPACING.xs
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12141A',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: SPACING.md,
    gap: 12
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.primary
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarLetter: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '900'
  },
  profileMeta: {
    flex: 1
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF'
  },
  profileEmail: {
    fontSize: 12,
    color: '#888',
    marginTop: 2
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF66'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00FF66',
    letterSpacing: 0.8
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: '#442222',
    backgroundColor: '#1A0A0A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm
  },
  logoutBtnText: {
    color: '#FF6666',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1
  }
});
