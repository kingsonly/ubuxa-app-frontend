/** @type {import('tailwindcss').Config} */
import scrollbarPlugin from "tailwind-scrollbar";
import plugin from "tailwindcss/plugin";

export default {
	mode: "jit",
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	darkMode: ["class", '[data-mode="dark"]'],
	theme: {
		extend: {
			fontFamily: {
				primary: [
					'Red Hat Display"',
					'sans-serif'
				],
				secondary: [
					'Lora"',
					'serif'
				]
			},
			colors: {
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				customAscent: 'var(--custom-ascent)',
				customButtonText: 'var(--custom-buttonText)',
				customPrimary: 'var(--custom-primary)',
				customSecondary: 'var(--custom-secondary)',
				textBlack: '#050505',
				textGrey: '#828DA9',
				textLightGrey: '#9BA4BA',
				textDarkGrey: '#49526A',
				textDarkBrown: '#32290E',
				strokeGrey: '#F6F8FA',
				strokeGreyTwo: '#E0E0E0',
				strokeGreyThree: '#EAEEF2',
				strokeCream: 'var(--custom-primary)',
				error: '#EA91B4',
				errorTwo: '#FC4C5D',
				paleLightBlue: '#EFF2FF',
				brightBlue: '#007AFF',
				success: '#00AF50',
				successTwo: '#E3FAD6',
				successThree: '#AEF1A7',
				disabled: '#E2E4EB',
				blackBrown: '#1E0604',
				gold: '#F8CB48',
				purpleBlue: '#DADFF8',
				pink: '#F7D3E1',
				inkBlue: '#8396E7',
				inkBlueTwo: '#3951B6',
				paleYellow: '#FFF3D5',
				chalk: '#FFFFFF',
				grape: '#EAD2D0',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			backgroundImage: {
				primaryGradient: 'linear-gradient(to right, var(--custom-primary), var(--custom-secondary))',
				errorGradient: 'linear-gradient(to right, var(--custom-primary), #473b15)',
				inversedErrorGradient: 'linear-gradient(to left, #982214, var(--custom-primary))',
				paleGrayGradient: 'linear-gradient(to right, var(--strokeGrey), var(--chalk))',
				paleGrayGradientLeft: 'linear-gradient(to left, var(--strokeGrey), var(--chalk))',
				paleCreamGradientLeft: 'linear-gradient(to left, var(--custom-primary), var(--chalk))'
			},
			boxShadow: {
				innerCustom: 'inset 1px 2px 4px rgba(0, 0, 0, 0.15)',
				menuCustom: '8px 12px 40px rgba(0, 0, 0, 0.15)',
				titlePillCustom: '1px 2px 10px rgba(0, 0, 0, 0.05)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			}
		}
	},
	plugins: [
		scrollbarPlugin({ nocompatible: true }),
		plugin(function ({ addUtilities }) {
			// Custom scrollbar utilities (optional)
			addUtilities({
				".scrollbar-thin": {
					"scrollbar-width": "thin",
				},
				".scrollbar-thumb-gray-400": {
					"scrollbar-color": "#9CA3AF transparent",
				},
				".scrollbar-track-gray-100": {
					"scrollbar-color": "transparent #F3F4F6",
				},
			});
		}),
		require("tailwindcss-animate")
	],
};
