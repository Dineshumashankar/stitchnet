import React, { useState, useRef, useEffect } from 'react';

const SignaturePad = ({ onSave, onClear }) => {
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState("'Dancing Script', cursive");
    const canvasRef = useRef(null);

    const fonts = [
        { name: 'Dancing Script', family: "'Dancing Script', cursive" },
        { name: 'Great Vibes', family: "'Great Vibes', cursive" },
        { name: 'Sacramento', family: "'Sacramento', cursive" },
        { name: 'Parisienne', family: "'Parisienne', cursive" },
        { name: 'Pinyon Script', family: "'Pinyon Script', cursive" },
        { name: 'Tangerine', family: "'Tangerine', cursive" },
        { name: 'Rochester', family: "'Rochester', cursive" },
    ];

    const symbols = [
        { name: 'None', char: '' },
        { name: 'Check', char: '✓' },
        { name: 'Star', char: '✦' },
        { name: 'Flower', char: '❀' },
        { name: 'Fleur-de-lis', char: '⚜' },
        { name: 'Nib', char: '✒' },
    ];

    const [selectedSymbol, setSelectedSymbol] = useState(symbols[0].char);

    const generateSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set background to transparent (or white if needed, but transparent is better for overlay)
        // ctx.fillStyle = "white";
        // ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Configure text style
        ctx.font = `50px ${selectedFont}`;
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw text and symbol in center
        const fullText = selectedSymbol ? `${selectedSymbol} ${typedName}` : typedName;
        ctx.fillText(fullText, canvas.width / 2, canvas.height / 2);

        return canvas.toDataURL('image/png');
    };

    const saveSignature = () => {
        if (!typedName.trim()) {
            alert("Please type your name first.");
            return;
        }
        const dataURL = generateSignature();
        onSave(dataURL);
    };

    const clearSignature = () => {
        setTypedName('');
        if (onClear) onClear();
    };

    return (
        <div style={{
            border: '2px solid #334155',
            borderRadius: '12px',
            padding: '24px',
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            maxWidth: '500px',
            width: '100%'
        }}>
            <div style={{ marginBottom: '20px' }}>
                <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#475569',
                    marginBottom: '8px'
                }}>
                    Type Your Name
                </label>
                <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Full Legal Name"
                    style={{
                        width: '100%',
                        padding: '12px',
                        fontSize: '1.2rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        outline: 'none',
                        color: '#1e293b',
                        marginBottom: '15px'
                    }}
                />

                <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#475569',
                    marginBottom: '8px'
                }}>
                    Select Signature Style
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '20px' }}>
                    {fonts.map((font) => (
                        <div
                            key={font.name}
                            onClick={() => setSelectedFont(font.family)}
                            style={{
                                border: selectedFont === font.family ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                backgroundColor: selectedFont === font.family ? '#eff6ff' : 'white',
                                transition: 'all 0.2s',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '50px'
                            }}
                        >
                            <span style={{
                                fontFamily: font.family,
                                fontSize: '1.2rem',
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {typedName || font.name}
                            </span>
                        </div>
                    ))}
                </div>

                <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#475569',
                    marginBottom: '8px'
                }}>
                    Add a Professional Symbol
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {symbols.map((symbol) => (
                        <div
                            key={symbol.name}
                            onClick={() => setSelectedSymbol(symbol.char)}
                            style={{
                                border: selectedSymbol === symbol.char ? '2px solid #2563eb' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '10px 15px',
                                cursor: 'pointer',
                                backgroundColor: selectedSymbol === symbol.char ? '#eff6ff' : 'white',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                minWidth: '45px'
                            }}
                            title={symbol.name}
                        >
                            {symbol.char || 'None'}
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '8px',
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                    fontWeight: '500'
                }}>
                    By clicking "Agree & Sign", you agree to be legally bound by this digital signature.
                </div>
            </div>

            {/* Hidden Canvas for generating the image */}
            <canvas ref={canvasRef} width={400} height={150} style={{ display: 'none' }}></canvas>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                    onClick={clearSignature}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        color: '#64748b',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Clear
                </button>
                <button
                    onClick={saveSignature}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#1d4ed8',
                        color: 'white',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgb(29 78 216 / 0.3)'
                    }}
                >
                    Agree & Sign
                </button>
            </div>
        </div>
    );
};

export default SignaturePad;
