/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
              "on-error-container": "#58160c",
              "on-secondary-container": "#2e3728",
              "surface-container-lowest": "#ffffff",
              "on-primary-fixed-variant": "#3b4f44",
              "on-tertiary": "#ffffff",
              "on-surface-variant": "#5c5b56",
              "on-primary-container": "#2e2f27",
              "charcoal-black": "#1f271f",
              "on-primary": "#ffffff",
              "on-tertiary-fixed-variant": "#152a44",
              "secondary": "#7B8B6C",
              "surface-container-highest": "#D9D1C4",
              "on-error": "#ffffff",
              "outline": "#B8AC99",
              "primary-fixed": "#e9e4da",
              "inverse-surface": "#1f241e",
              "surface-container-high": "#EAE2D5",
              "on-secondary": "#ffffff",
              "surface-bright": "#FDFBF6",
              "tertiary-container": "#325970",
              "inverse-on-surface": "#f4efe6",
              "on-secondary-fixed": "#2f3a2d",
              "secondary-fixed-dim": "#c1c6b2",
              "paper-white": "#FFFFFF",
              "inverse-primary": "#f0efe9",
              "safety-green": "#A7B394",
              "tertiary-fixed": "#d9e7f0",
              "surface-container-low": "#F4EFE6",
              "surface": "#FFFFFF",
              "muted-stone": "#6F7B65",
              "surface-container": "#F7F2E8",
              "tertiary": "#4A6B7C",
              "surface-tint": "#9A8E7F",
              "surface-dim": "#E8E1D5",
              "primary-container": "#E8E1D2",
              "background": "#F7F2E8",
              "on-surface": "#3A342F",
              "on-background": "#3A342F",
              "outline-variant": "#D3C9B3",
              "primary-fixed-dim": "#a2b292",
              "on-tertiary-fixed": "#1f3b57",
              "error-container": "#f8dcda",
              "error": "#b82523",
              "on-tertiary-container": "#ffffff",
              "secondary-fixed": "#c3c9b0",
              "on-primary-fixed": "#384a2f",
              "primary": "#1B4D5C",
              "on-secondary-fixed-variant": "#35402f",
              "secondary-container": "#D8D4C5",
              "tertiary-fixed-dim": "#7691a4",
              "editorial-cream": "#F7F2E8",
              "surface-variant": "#E8E1D7",
              // Custom Named Palette
              "deep-olive": "#1B4D5C",
              "olive": "#70816B",
              "sage": "#7DC242",
              "light-sage": "#E8F5D0",
              "mist": "#E8E3D8",
              "beige": "#F7F2E8",
              "warm-tan": "#CDB59C",
              // Premium Blue Accents (to satisfy the green/blue global rule)
              "deep-blue": "#37586C",
              "ocean-blue": "#3F778C",
              "classic-blue": "#4B6B8B",
              "soft-blue": "#DAE7F1"
      },
      "borderRadius": {
              "DEFAULT": "0.25rem",
              "lg": "0.5rem",
              "xl": "0.75rem",
              "full": "9999px"
      },
      "spacing": {
              "margin-mobile": "16px",
              "stack-md": "24px",
              "stack-lg": "64px",
              "margin-desktop": "48px",
              "gutter": "24px",
              "stack-sm": "8px",
              "container-max": "1280px"
      },
      "fontFamily": {
              "body-md": [
                      "Inter"
              ],
              "label-caps": [
                      "Inter"
              ],
              "headline-lg": [
                      "EB Garamond"
              ],
              "display-lg": [
                      "EB Garamond"
              ],
              "display-lg-mobile": [
                      "EB Garamond"
              ],
              "body-lg": [
                      "Inter"
              ],
              "quote": [
                      "EB Garamond"
              ],
              "headline-xl": [
                      "EB Garamond"
              ]
      },
      "fontSize": {
              "body-md": [
                      "16px",
                      {
                              "lineHeight": "1.5",
                              "fontWeight": "400"
                      }
              ],
              "label-caps": [
                      "12px",
                      {
                              "lineHeight": "1",
                              "letterSpacing": "0.1em",
                              "fontWeight": "600"
                      }
              ],
              "headline-lg": [
                      "32px",
                      {
                              "lineHeight": "1.3",
                              "fontWeight": "500"
                      }
              ],
              "display-lg": [
                      "72px",
                      {
                              "lineHeight": "1.1",
                              "letterSpacing": "-0.02em",
                              "fontWeight": "500"
                      }
              ],
              "display-lg-mobile": [
                      "48px",
                      {
                              "lineHeight": "1.1",
                              "fontWeight": "500"
                      }
              ],
              "body-lg": [
                      "18px",
                      {
                              "lineHeight": "1.6",
                              "fontWeight": "400"
                      }
              ],
              "quote": [
                      "24px",
                      {
                              "lineHeight": "1.4",
                              "fontWeight": "400"
                      }
              ],
              "headline-xl": [
                      "48px",
                      {
                              "lineHeight": "1.2",
                              "fontWeight": "500"
                      }
              ]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
