import jsPDF from 'jspdf';
import { Item } from '../types';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { toast } from 'react-hot-toast';

export const pdfService = {
    generateWardrobePDF: async (items: Item[]) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Title
            doc.setFontSize(22);
            doc.setTextColor(73, 100, 114); // Slate Blue Primary #496472
            doc.text('My Wardrobe Catalog', 10, 20);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 28);

            let yPos = 40;
            const itemHeight = 60;

            for (const item of items) {
                if (yPos + itemHeight > 280) {
                    doc.addPage();
                    yPos = 20;
                }

                if (item.image_path.startsWith('data:image')) {
                    try {
                        doc.addImage(item.image_path, 'JPEG', 10, yPos, 40, 50, undefined, 'FAST');
                    } catch (err) {
                        // ignore image errors
                    }
                } else {
                    doc.rect(10, yPos, 40, 50);
                    doc.text('No Image', 15, yPos + 25);
                }

                doc.setFontSize(14);
                doc.setTextColor(0);
                doc.text(item.category.toUpperCase(), 60, yPos + 10);

                doc.setFontSize(11);
                doc.setTextColor(60);
                doc.text(`Color: ${item.color}`, 60, yPos + 20);
                doc.text(`Season: ${item.season}`, 60, yPos + 28);
                doc.text(`Occasion: ${item.occasion}`, 60, yPos + 36);

                if (item.notes) {
                    const splitNotes = doc.splitTextToSize(`Notes: ${item.notes}`, pageWidth - 70);
                    doc.text(splitNotes, 60, yPos + 46);
                }

                doc.setDrawColor(220);
                doc.line(10, yPos + 55, pageWidth - 10, yPos + 55);

                yPos += itemHeight;
            }

            // Output as Base64 String
            const pdfBase64 = doc.output('datauristring').split(',')[1];

            // Save to Filesystem
            const fileName = `wardrobe_catalog_${Date.now()}.pdf`;

            await Filesystem.writeFile({
                path: fileName,
                data: pdfBase64,
                directory: Directory.Documents,
            });

            toast.success(`Saved to Documents/${fileName}`);

        } catch (e) {
            console.error("PDF Generation Error", e);
            toast.error("Failed to save PDF");
        }
    }
};
