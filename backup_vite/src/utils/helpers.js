// --- HELPER: KOMPRES GAMBAR OTOMATIS ---
export const compressImage = async (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;

                if (img.width > MAX_WIDTH) {
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                }

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                resolve(dataUrl);
            };
        };
    });
};

// --- HELPER: CONVERT GOOGLE DRIVE LINK ---
export const getGoogleDriveImgUrl = (url) => {
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
