// --- HELPER: KOMPRES GAMBAR OTOMATIS (Returns Blob for Upload) ---
export const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = (err) => reject(err);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_WIDTH = 1200; // Increased for better news quality

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error('Canvas toBlob failed'));
                        },
                        'image/jpeg',
                        0.7 // Quality
                    );
                } else {
                    reject(new Error('Canvas context failed'));
                }
            };
        };
    });
};

// --- HELPER: CONVERT GOOGLE DRIVE LINK ---
export const getGoogleDriveImgUrl = (url: string): string => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
        const idMatch = url.match(/\/d\/(.*?)\/|\/d\/(.*)/);
        const fileId = idMatch ? (idMatch[1] || idMatch[2]) : null;
        if (fileId) {
            return `https://lh3.googleusercontent.com/d/${fileId}`;
        }
    }
    return url;
};
