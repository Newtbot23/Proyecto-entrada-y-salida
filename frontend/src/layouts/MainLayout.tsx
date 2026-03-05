import React from 'react';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const layoutStyle: React.CSSProperties = {
        maxWidth: '1200px', // Constrain width
        margin: '0 auto',   // Center
        padding: '2rem 1rem', // Padding for small screens
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Center vertically (optional, but good for single view)
    };

    return (
        <div style={layoutStyle}>
            {children}
        </div>
    );
};
