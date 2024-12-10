import User from '../../database/models/user.model.js';
import { createHash,  generateResetToken, sendEmail } from '../../libs/index.js';
import fs from 'fs-extra';

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resetToken = generateResetToken();
    const resetTokenExpires = Date.now() + 3600000; // 1 hour expiration

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const emailSubject = 'Recuperación de contraseña de Caffeine';
    const emailText = `Has solicitado recuperar tu contraseña. Dale click al enlace para conseguirlo: ${resetLink}. Tu token es: ${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      text: emailText,
    });

    res.status(200).json({ message: 'Se ha enviado un correo con tu token para recuperar la contraseña' });
  } catch (error) {
    res.status(500).json({ message: 'Error handling password reset request.', error });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find the user with the provided token and ensure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalido o expirado' });
    }

    // Hash the new password
    const hashedPassword = await createHash(newPassword);

    // Update user's password and clear the reset token and expiration
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Contraseña cambiada con éxito, ahora puedes iniciar sesión con tu nueva contraseña' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password.', error });
  }
};

