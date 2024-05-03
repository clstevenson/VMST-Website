import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function PageIndicator() {
  const location = useLocation();
  const [pathHistory, setPathHistory] = useState(['VMST', 'Home']);

  useEffect(() => {
    const newPath = location.pathname.replace('/', ''); // Remove leading slash
    const paths = newPath === '' ? ['Home'] : [newPath];
    setPathHistory(['VMST', ...paths]);
  }, [location]);

  const navigateToPage = (page) => {
    window.location.href = `/${page}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '5px', backgroundColor: 'rgba(122, 193, 68, 225)' }}>
      <p style={{ marginLeft: '25px', color: 'white' }}>
        {pathHistory.map((path, index) => (
          <span key={index} style={{ margin: index === 1 ? '0 3px' : '0' }}> {/* Apply margin only to 'Home' */}
            {index > 0 && ' > '}
            {index === pathHistory.length - 1 ? (
              <a href={`/${path}`} style={{ color: 'white', textDecoration: 'none', cursor: 'pointer' }} onClick={() => navigateToPage(path)}>
                {path}
              </a>
            ) : (
              path
            )}
          </span>
        ))}
      </p>
    </div>
  );
}

export default PageIndicator;