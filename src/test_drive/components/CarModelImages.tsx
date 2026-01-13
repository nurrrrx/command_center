import { useMemo } from 'react';
import { popularModelsData } from '../data/mockData';
import './CarModelImages.css';

interface CarModelImagesProps {
  headless?: boolean;
  modelOrder?: string[];
}

export function CarModelImages({ headless = false, modelOrder }: CarModelImagesProps) {
  // Use provided model order or default to sorted popular models
  const sortedModels = useMemo(() => {
    if (modelOrder) {
      return modelOrder;
    }
    return [...popularModelsData]
      .sort((a, b) => b.testDrives - a.testDrives)
      .map(d => d.model);
  }, [modelOrder]);

  return (
    <div className={`car-model-images ${headless ? 'headless' : ''}`}>
      {!headless && (
        <div className="chart-header">
          <h3 className="chart-title">Car Models</h3>
          <p className="chart-subtitle">Lexus model lineup</p>
        </div>
      )}
      <div className="car-images-list">
        {sortedModels.map((model) => {
          // Convert model name to expected image filename (e.g., "RX 350" -> "rx_350.png")
          const imageFileName = model.toLowerCase().replace(/\s+/g, '_') + '.png';
          const imagePath = `/cars/${imageFileName}`;

          return (
            <div key={model} className="car-image-row">
              <div className="car-image-container">
                <img
                  src={imagePath}
                  alt={model}
                  className="car-image"
                  onError={(e) => {
                    // If image fails to load, show placeholder
                    (e.target as HTMLImageElement).style.display = 'none';
                    const placeholder = (e.target as HTMLImageElement).nextElementSibling;
                    if (placeholder) {
                      (placeholder as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="car-image-placeholder" style={{ display: 'none' }}>
                  <span className="placeholder-text">{model}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CarModelImages;
