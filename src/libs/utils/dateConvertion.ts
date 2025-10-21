
export function DateConvertion(dateString: any) {
    if (!dateString) return '-';
    const d = new Date(dateString);
    const now = new Date();
    const ms = now.getTime() - d.getTime();
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);

    const isYesterday = (() => {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        return d.getFullYear() === y.getFullYear() && d.getMonth() === y.getMonth() && d.getDate() === y.getDate();
    })();

    if (sec < 60) return 'Just now';
    if (min < 60) return `${min}m ago`;
    if (hr < 24) return `${hr}h ago`;
    if (isYesterday) return 'Yesterday';

    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}