const jwt = require("jsonwebtoken");

io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
});

export default roleSocket;
