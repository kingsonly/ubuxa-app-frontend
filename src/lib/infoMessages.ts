export const infoMessages = {
    dashboard: {
        revenueCard: "This shows your total revenue from all product sales in the current month.",
        customerGrowth: "Tracks how your customer base is increasing over time.",
    },
    settings: {
        apiKeys: "API keys allow you to securely connect third-party services.",
        billing: "Manage your subscription and payment methods here.",
    },
    inventory: {
        hasDevice: "Turn this on if you want to track each item in this inventory by its unique serial number. Once enabled, you’ll be required to upload the list of device serials on the Device page. During sales, the system will enforce selecting a specific device to complete the transaction. This is ideal for items where individual tracking is important (e.g., IoT devices, smart meters, batteries). You can also create a new device during checkout if the serial hasn’t been pre-uploaded.",
    },
    device: {
        isTokenable: "When this is switched on, the app can make “tokens” (think of them like prepaid airtime PINs). You buy a token to unlock your device once, or you can buy a token that keeps it working for a set number of days—so you only pay for exactly the time you need, just like topping up airtime.",
        restrictedDigitMode: "When this is turned on, your device will only accept unlock codes made up of numbers—no letters or symbols allowed. Think of it like setting a simple ATM PIN: you just punch in digits (0–9) to get in. It keeps things straightforward and avoids mistakes from typing other characters.",
        unlock: "YES → Your device stays unlocked without using up any tokens. Think of it like an “unlimited data” bundle: once you switch this on, you don’t have to worry about topping up . NO → You’ll buy a one - time “token” that gives you a set number of days’ access.Just enter how many days you want, hit “Generate,” and your device will lock again when those days run out.",
    },
};
