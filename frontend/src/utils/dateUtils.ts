export const formatDateSafe = (dateString: string | undefined | null): string => {
    if (!dateString) return 'N/A';

    // Check if the string matches the YYYY-MM-DD pattern at the start
    // This could also have time attached, e.g., '2026-02-23T22:21:24.000000Z'
    // but the split logic handles it without timezone adjustments.
    const regex = /^(\d{4})-(\d{2})-(\d{2})/;
    const match = dateString.match(regex);

    if (match) {
        // Return DD/MM/YYYY enforcing local visualization without actual offset shifts
        return `${match[3]}/${match[2]}/${match[1]}`;
    }

    // Fallback using standard JS parsing if completely different format
    return new Date(dateString).toLocaleDateString();
};
