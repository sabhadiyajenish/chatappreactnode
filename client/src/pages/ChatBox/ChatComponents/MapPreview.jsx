import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const MapPreview = ({ latitude, longitude }) => {
  const position = [latitude, longitude];
  return (
    <MapContainer center={position} zoom={13} className="h-10 w-40">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapPreview;
