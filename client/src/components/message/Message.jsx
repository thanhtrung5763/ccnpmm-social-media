import { format } from "timeago.js";
import "./message.css";
import LinkPreview from '@dhaiwat10/react-link-preview';
export default function Message({ message, own, testManual=null, videoMetadata }) {
  return testManual === null ?  (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        {own ?
          (null) :
          (<img
            className="messageImg"
            src="https://images.pexels.com/photos/3686769/pexels-photo-3686769.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
            alt=""
          />)
        }
        {message.type === "text" ?
          (<p className="messageText">{message.text}</p>) :
          message.type === "image" ?
            (
              <a href={message.file_url} target="_blank" rel="noopener noreferrer">
              <img src={message.file_url} className="imageMessage"></img>
              </a>
            ) :
          message.type === "video_link" ?
            (
                <div className="chatVideoContainer">
                <span>
                  <div className="chatVideoUrl">
                  <a href={message?.text} target="_blank" rel="noreferrer">{message?.text}</a>
                  </div>
                  <div className="chatVideoThump">
                    <a href={message?.text} target="_blank" rel="noreferrer">
                      <div>
                        <div>
                          <img src={message?.file_url} alt=""/>
                        </div>
                        <div className="chatVideoTitle">
                          <span>{message.title}</span>
                        </div>
                      </div>
                    </a>
                  </div>
                </span>
              </div>
            ) : 
          message.type === "audio" ? 
            (
              <audio controls><source src={message?.file_url} type="audio/mpeg"></source></audio>
            ) :
          message.type === "clip" ? 
          (
            <video controls width="480" heigh="270"><source src={message?.file_url} type="video/mp4"/></video>
          ) : (null)
        }
        {/* <audio controls><source src="https://social-network-cnpmm.s3.ap-southeast-1.amazonaws.com/1700731208402-liveStreamingOff.mp3" type="audio/mpeg"></source></audio> */}
        {/* <video controls width="480" heigh="270"><source src="https://social-network-cnpmm.s3.ap-southeast-1.amazonaws.com/1700735031906-Untitled.mp4" type="video/mp4"/></video> */}
        {/* <a href="https://www.tiktok.com/@anhemlowcode/video/7304319266227080453" ref="nofollow noreferrer"/> */}
      </div>
      <div className="messageBottom">{format(message.createdAt)}</div>
    </div>
  ) : (
    <div className={own ? "message own" : "message"}>
      <div className="messageTop">
        {own ?
          (null) :
          (<img
            className="messageImg"
            src="https://images.pexels.com/photos/3686769/pexels-photo-3686769.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500"
            alt=""
          />)
        }
        {/* {message.type === "text" ?
          (<p className="messageText">{message.text}</p>) :
          (<img src={message.text} className="imageMessage"></img>)
        } */}
        {/* <audio controls><source src="https://social-network-cnpmm.s3.ap-southeast-1.amazonaws.com/1700731208402-liveStreamingOff.mp3" type="audio/mpeg"></source></audio> */}
        {/* <video controls width="480" heigh="270"><source src="https://social-network-cnpmm.s3.ap-southeast-1.amazonaws.com/1700735031906-Untitled.mp4" type="video/mp4"/></video> */}
        {/* <a href="https://www.tiktok.com/@anhemlowcode/video/7304319266227080453" ref="nofollow noreferrer"/> */}
        <div className="chatVideoContainer">
          <span>
            <div className="chatVideoUrl">
            <a href={videoMetadata?.url} target="_blank" rel="noreferrer">{videoMetadata?.url}</a>
            </div>
            <div className="chatVideoThump">
              <a href={videoMetadata?.url} target="_blank" rel="noreferrer">
                <div>
                  <div>
                    <img src={videoMetadata?.file_url} alt=""/>
                  </div>
                  <div className="chatVideoTitle">
                    <span>TikTok · Phát | Technical Leader</span>
                  </div>
                </div>
              </a>
            </div>
          </span>
        </div>
      </div>
      {/* <div className="messageBottom">{format(message.createdAt)}</div> */}
    </div>
  );
}
