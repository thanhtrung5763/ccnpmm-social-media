const axios = require('axios');
const { getVideoMetadata } = require('./services/oembed');
const stream = require('stream');
const fs = require('fs');

const {uploadLocalFile, uploadImageToS3} = require('./s3.config')


const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const handleUploadLocalFile = async (file, fileName, mimeType) => {
  const data = new FormData();
  data.append("file", file);
  // Upload the image to S3
  console.log("socket file: ", file)
  
  const bufferStream = new stream.PassThrough();
  bufferStream.end(file);
  fileName = Date.now().toString() + '-' + fileName;
  const url = await uploadImageToS3(bufferStream, fileName, mimeType)
  console.log(url)
  return url
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");

  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", async ({ senderId, receiverId, text, type, file, fileName, mimeType }) => {
    const user = getUser(receiverId);
    if (type === "video_link") {
      try {
        const res = await getVideoMetadata(text);
        console.log("abcxyz" + res)
        videoMetadata = res;
        const thumbnail_res = await axios.get(videoMetadata.file_url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(thumbnail_res.data, 'binary');
        console.log(buffer)
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        // const writableStream = fs.createWriteStream('output_image.jpg');
        // bufferStream.pipe(writableStream);
        // writableStream.on('finish', () => {
        //   console.log('Buffer data written to file successfully.');
        // });

        // file_url = await handleUploadImage(bufferStream)
        const fileName = Date.now().toString() + `.jpeg`;
        const mimeType = "image/jpeg"
        const file_url = await uploadImageToS3(bufferStream, fileName, mimeType)
        console.log(file_url)
        
        const title = videoMetadata.title
        io.to(getUser(senderId).socketId).emit("getMetadata", {
          title,
          file_url
        });
        if (user !== undefined) {
          io.to(user.socketId).emit("getMessage", {
            senderId,
            text,
            type,
            title,
            file_url
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
    else if (type === "image" || type === "audio" || type === "clip"){
      url = await handleUploadLocalFile(file, fileName, mimeType)
      console.log(url)
      const title = null
      const file_url = url
      if (user !== undefined) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
          type,
          title,
          file_url,
        });
      }
      io.to(getUser(senderId).socketId).emit("getMetadata", {
        title,
        file_url
      });
    }
    else {
      if (user !== undefined) {
        io.to(user.socketId).emit("getMessage", {
          senderId,
          text,
          type
        });
      }
    }
    
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
