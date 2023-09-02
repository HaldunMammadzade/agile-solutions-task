import React, { useState, useEffect } from "react";
import Exif from "exif-js";
import MapComponent from "./MapComponent";

function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [error, setError] = useState(null);
  const [speechSynthesisInstance, setSpeechSynthesisInstance] = useState(null);
  useEffect(() => {
    if (selectedImage) {
      getCoordinatesAndDateFromImage(selectedImage)
        .then((info) => {
          setImageInfo(info);
          setError(null);
        })
        .catch((err) => {
          const fallbackInfo = {
            name: selectedImage.name,
            type: selectedImage.type,
            size: `${(selectedImage.size / 1024).toFixed(2)} KB`,
          };

          setImageInfo(fallbackInfo);
          setError(null);
        });
    }
  }, [selectedImage]);

  useEffect(() => {
    window.onbeforeunload = () => {
        if (speechSynthesisInstance) {
          speechSynthesisInstance.cancel();
        }
      };
      return () => {
        window.onbeforeunload = null;
      };
  }, [selectedImage, speechSynthesisInstance]);

  // get coordinates and other info
  function getCoordinatesAndDateFromImage(imageUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageUrl;

      image.onload = () => {
        Exif.getData(image, function () {
          const lat = Exif.getTag(this, "GPSLatitude");
          const lon = Exif.getTag(this, "GPSLongitude");
          const dateTaken = Exif.getTag(this, "DateTimeOriginal");
          const make = Exif.getTag(this, "Make");
          const model = Exif.getTag(this, "Model");
          const imageInfo = {
            name: imageUrl.substring(imageUrl.lastIndexOf("/") + 1),
            type: imageUrl.substring(imageUrl.lastIndexOf(".") + 1),
            size: `${(image.width / 1024).toFixed(2)} KB`,
            make,
            model,
          };

          if (lat && lon && dateTaken) {
            const latitude = lat[0] + lat[1] / 60 + lat[2] / 3600;
            const longitude = lon[0] + lon[1] / 60 + lon[2] / 3600;
            resolve({
              ...imageInfo,
              latitude,
              longitude,
              dateTaken,
            });
          } else {
            resolve(imageInfo);
          }
          image.onerror = (err) => {
            reject(err);
          };
        });
      };

      image.onerror = (err) => {
        reject(err);
      };
    });
  }

  // text speech
  function speakText(text, rate = 1, volume = 1) {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = rate;
      speech.volume = volume;
      setSpeechSynthesisInstance(window.speechSynthesis);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Browser not allowed text speech");
    }
  }

  const handleFileInputChange = (e) => {
    setSelectedImage(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div className="container">
      <h1 style={{textAlign: "center"}}>Upload Image</h1>
      <div className="image-info">
        <div>
          <label htmlFor="fileInput" className="file-input-label">
            <p className="upload-button">Choose Your File</p>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: "none" }}
            />
          </label>
          <div className="selected-image">
            {selectedImage && <img src={selectedImage} alt="Uploaded Image" />}
          </div>
        </div>
        <div>
          {imageInfo && (
            <div>
              <h2>Image Info</h2>
              <button className="upload-button"
                onClick={() =>
                  speakText(
                    `Filename: ${imageInfo.name}. Mime type: ${imageInfo.type}. Size: ${imageInfo.size}. Coordinates: ${imageInfo.latitude}, ${imageInfo.longitude}. Date: ${imageInfo.dateTaken}.`
                  )
                }
              >
                Text to speech button
              </button>
              <ul style={{listStyle: "none", paddingLeft: "0"}}>
                <li>
                  <strong>Filename:</strong> {imageInfo.name}
                </li>
                <li>
                  <strong>Mime type:</strong> {imageInfo.type}
                </li>
                <li>
                  <strong>Size:</strong> {imageInfo.size}
                </li>
                {imageInfo.latitude && imageInfo.longitude && (
                  <li>
                    <strong>Coordinates:</strong> {imageInfo.latitude},{" "}
                    {imageInfo.longitude}
                  </li>
                )}
                {imageInfo.dateTaken && (
                  <li>
                    <strong>Date:</strong> {imageInfo.dateTaken}
                  </li>
                )}
                {imageInfo.make && (
                  <li>
                    <strong>Device:</strong> {imageInfo.make} , {imageInfo.model}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
      {error && <p>{error}</p>}
      {imageInfo && imageInfo.latitude && imageInfo.longitude && (
        <MapComponent
          latitude={imageInfo.latitude}
          longitude={imageInfo.longitude}
        />
      )}
    </div>
  );
}

export default ImageUploader;
