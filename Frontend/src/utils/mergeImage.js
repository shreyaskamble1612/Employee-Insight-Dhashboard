const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });

const dataUrlToBlob = async (dataUrl) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

export async function mergeImages(photo, signature) {
  const [photoImage, signatureImage] = await Promise.all([loadImage(photo), loadImage(signature)]);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = photoImage.width;
  canvas.height = photoImage.height;

  context.drawImage(photoImage, 0, 0, canvas.width, canvas.height);
  context.drawImage(signatureImage, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL("image/png");

  return {
    dataUrl,
    blob: await dataUrlToBlob(dataUrl)
  };
}