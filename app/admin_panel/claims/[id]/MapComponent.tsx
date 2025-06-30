'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Создаем кастомную иконку маркера
const createMarkerIcon = () => {
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });
};

// Компонент для управления центром карты
const SetMapCenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
};

// Компонент для скрытия стандартного атрибута
const HideAttribution = () => {
  const map = useMap();

  useEffect(() => {
    const attributionControl = map.attributionControl;
    attributionControl.setPrefix(''); // Убираем текст атрибуции
    return () => {
      attributionControl.setPrefix('Leaflet'); // Восстанавливаем по умолчанию
    };
  }, [map]);

  return null;
};

const MapComponent = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  const position: [number, number] = [latitude, longitude];
  const markerIcon = createMarkerIcon();

  return (
    <div className='h-full w-full rounded-md'>
      <MapContainer
        center={position}
        zoom={15}
        style={{ height: '100%', width: '100%', borderRadius: '0.375rem' }}
        zoomControl={false}
      >
        <TileLayer
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          maxZoom={19}
        />
        <Marker
          position={position}
          icon={markerIcon}
        />
        <SetMapCenter center={position} />
        <HideAttribution />
      </MapContainer>
    </div>
  );
};

export default MapComponent;
