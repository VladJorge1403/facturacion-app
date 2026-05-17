import { apiRequest } from './api';

export async function obtenerUrlSubida(nombreArchivo, tipoArchivo) {
    return await apiRequest('/s3/presigned-url', {
        method: 'POST',
        body: JSON.stringify({
            nombreArchivo,
            tipoArchivo,
        }),
    });
}

export async function subirArchivoAS3(uri, nombreArchivo, tipoArchivo) {
    const { uploadUrl, fileUrl } = await obtenerUrlSubida(nombreArchivo, tipoArchivo);

    const archivo = await fetch(uri);
    const blob = await archivo.blob();

    await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': tipoArchivo,
        },
        body: blob,
    });

    return fileUrl;
}