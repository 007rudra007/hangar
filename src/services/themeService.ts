import {
    argbFromHex,
    themeFromSourceColor,
    hexFromArgb
} from "@material/material-color-utilities";

// Default Seed (Redwood)
const DEFAULT_SEED = "#A35C4E";

export const themeService = {
    // Apply a theme based on a hex seed color
    applyTheme: (seedHex: string = DEFAULT_SEED, isDark: boolean = false) => {
        try {
            const seedInt = argbFromHex(seedHex);
            const theme = themeFromSourceColor(seedInt);

            const scheme = isDark ? theme.schemes.dark : theme.schemes.light;

            const root = document.documentElement;

            // Helper to set HSL from ARGB
            const setVar = (name: string, argb: number) => {
                const hex = hexFromArgb(argb);
                // Convert to HSL for Tailwind (since we setup index.css with HSL)
                // OR: Update index.css to use HEX if we want simpler integration.
                // Given previous step used HSL, let's convert or just set the CSS var to 'R G B' if we change Tailwind to use rgb().
                // Actually, Tailwind config in previous step uses `hsl(var(--p) / <alpha>)`.
                // So we MUST convert to HSL.

                const [h, s, l] = hexToHSL(hex);
                root.style.setProperty(name, `${h} ${s}% ${l}%`);
            };

            setVar('--p', scheme.primary);
            setVar('--op', scheme.onPrimary);
            setVar('--pc', scheme.primaryContainer);
            setVar('--opc', scheme.onPrimaryContainer);

            setVar('--bg', scheme.background);
            setVar('--obg', scheme.onBackground);

            setVar('--s', scheme.surface);
            setVar('--os', scheme.onSurface);

            setVar('--sv', scheme.surfaceVariant);
            setVar('--osv', scheme.onSurfaceVariant);

            setVar('--sec', scheme.secondary);
            setVar('--on-sec', scheme.onSecondary);
            setVar('--sec-c', scheme.secondaryContainer);
            setVar('--on-sec-c', scheme.onSecondaryContainer);

            // Save preference
            localStorage.setItem('theme_seed', seedHex);

        } catch (e) {
            console.error("Failed to apply theme", e);
        }
    },

    getSavedSeed: () => {
        return localStorage.getItem('theme_seed') || DEFAULT_SEED;
    }
};

// Helper: Hex to HSL
function hexToHSL(H: string) {
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = parseInt("0x" + H[1] + H[1]);
        g = parseInt("0x" + H[2] + H[2]);
        b = parseInt("0x" + H[3] + H[3]);
    } else if (H.length == 7) {
        r = parseInt("0x" + H[1] + H[2]);
        g = parseInt("0x" + H[3] + H[4]);
        b = parseInt("0x" + H[5] + H[6]);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h, s, l];
}
