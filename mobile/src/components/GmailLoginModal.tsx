import React from 'react';
import { AuthModal, UserProfile, AuthModalProps } from './AuthModal';

export interface GmailLoginModalProps extends AuthModalProps {}

export const GmailLoginModal: React.FC<GmailLoginModalProps> = (props) => {
  return <AuthModal {...props} />;
};

export default GmailLoginModal;
