async function decryptData(encryptedData, keyHex) {
  // Ensure encryptedData is a string
  if (typeof encryptedData !== "string") {
    throw new TypeError("encryptedData should be a string");
  }

  // Convert hex key to ArrayBuffer
  const keyBytes = new Uint8Array(
    keyHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  const keyBuffer = keyBytes.buffer;

  // Import the key
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "AES-CBC", length: 256 },
    false,
    ["decrypt"]
  );

  // Split the encrypted data into IV and ciphertext
  const [ivHex, encryptedTextHex] = encryptedData.split(":");
  if (!ivHex || !encryptedTextHex) {
    throw new Error("Invalid encryptedData format");
  }
  const iv = new Uint8Array(
    ivHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  ).buffer;
  const encryptedBytes = new Uint8Array(
    encryptedTextHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  ).buffer;

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    encryptedBytes
  );

  // Convert ArrayBuffer to string
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

export { decryptData };
