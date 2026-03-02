const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertGroup(n: number): string {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertGroup(n % 100) : '');
}

export function numberToWordsINR(amount: number): string {
    if (amount === 0) return 'INR Zero Only';
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let result = '';
    if (rupees >= 10000000) {
        result += convertGroup(Math.floor(rupees / 10000000)) + ' Crore ';
    }
    const rem1 = rupees % 10000000;
    if (rem1 >= 100000) {
        result += convertGroup(Math.floor(rem1 / 100000)) + ' Lakh ';
    }
    const rem2 = rem1 % 100000;
    if (rem2 >= 1000) {
        result += convertGroup(Math.floor(rem2 / 1000)) + ' Thousand ';
    }
    const rem3 = rem2 % 1000;
    if (rem3 > 0) {
        result += convertGroup(rem3);
    }

    result = 'INR ' + result.trim();
    if (paise > 0) {
        result += ' and ' + convertGroup(paise) + ' Paise';
    }
    return result + ' Only';
}
