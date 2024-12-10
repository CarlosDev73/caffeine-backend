
export const renewToken = async (req, res) => {

  try {

    const user = req.user;
    const currentTime = Math.floor(Date.now() / 1000);
    const expTime = user.exp;
 
    if (expTime - currentTime < 86400)
      return res.status(500).json({ message: 'Aun el token no expira.', error });

    const token = await createAccesToken({id: user.payload.id, username: user.userName});

    res.status(200).json({ message: 'Token renovado con exito.', data: { token: token } });
  } catch (error) {
    res.status(500).json({ message: 'Error en la renovacion del token.', error });
  }
}
