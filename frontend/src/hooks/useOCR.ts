import { useState } from 'react';
import { readPlate, readSerial } from '../services/userDashboardService';

export const useOCR = () => {
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const [isOcrEquipoLoading, setIsOcrEquipoLoading] = useState(false);

    const performPlateOCR = async (file: File) => {
        setIsOcrLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await readPlate(formData);
            return { success: res.success, plate: res.placa || res.plate };
        } catch (err) {
            console.error("OCR Plate Error", err);
            return { success: false };
        } finally {
            setIsOcrLoading(false);
        }
    };

    const performSerialOCR = async (file: File) => {
        setIsOcrEquipoLoading(true);
        const formData = new FormData();
        formData.append('image', file);
        try {
            const res = await readSerial(formData);
            return { success: res.success, serial: res.serial || res.extracted_serial };
        } catch (err) {
            console.error("OCR Serial Error", err);
            return { success: false };
        } finally {
            setIsOcrEquipoLoading(false);
        }
    };

    return {
        isOcrLoading,
        isOcrEquipoLoading,
        performPlateOCR,
        performSerialOCR
    };
};
