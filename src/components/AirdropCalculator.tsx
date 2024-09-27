import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AirdropCalculator = () => {
    const [points, setPoints] = useState('');
    const [convertRatio, setConvertRatio] = useState('');
    const [tokenValue, setTokenValue] = useState('');
    const [result, setResult] = useState<{ tokens: number; valueUsd: number; valueIdr: number } | null>(null);
    const [error, setError] = useState('');
    const [usdToIdrRate, setUsdToIdrRate] = useState<number | null>(null);
    const [isLoadingRate, setIsLoadingRate] = useState(false);

    useEffect(() => {
        fetchExchangeRate();
    }, []);

    const fetchExchangeRate = async () => {
        setIsLoadingRate(true);
        setError('');
        try {
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (!response.ok) {
                throw new Error('Respon jaringan tidak OK');
            }
            const data = await response.json();
            setUsdToIdrRate(data.rates.IDR);
            setError('');
        } catch (err) {
            console.error('Error fetching exchange rate:', err);
            setError('Gagal mengambil kurs mata uang terbaru. Silakan coba lagi nanti.');
            setUsdToIdrRate(15000); // Nilai default jika gagal mengambil data
        } finally {
            setIsLoadingRate(false);
        }
    };

    const parseRatio = (ratio: string) => {
        const parts = ratio.split(':');
        if (parts.length !== 2) {
            throw new Error('Format rasio tidak valid. Gunakan format "1:10" atau sejenisnya.');
        }
        const [left, right] = parts.map(Number);
        if (isNaN(left) || isNaN(right) || right === 0) {
            throw new Error('Rasio harus berisi angka valid dan pembagi tidak boleh nol.');
        }
        return right / left;
    };

    const calculateAirdrop = () => {
        try {
            setError('');
            const pointsNum = parseFloat(points);
            const tokenValueNum = parseFloat(tokenValue);
            const conversionFactor = parseRatio(convertRatio);

            if (isNaN(pointsNum) || isNaN(tokenValueNum)) {
                throw new Error('Mohon masukkan angka yang valid untuk semua field.');
            }

            const tokens = pointsNum / conversionFactor;
            const valueUsd = tokens * tokenValueNum;
            const valueIdr = valueUsd * (usdToIdrRate ?? 15000);

            setResult({ tokens, valueUsd, valueIdr });
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Terjadi kesalahan yang tidak diketahui');
            }
            setResult(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md md:max-w-lg lg:max-w-xl p-4">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center flex items-center justify-center">
                        <Calculator className="mr-2" />
                        Kalkulator Hasil Airdrop
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="points">Jumlah Point Airdrop</Label>
                            <Input
                                id="points"
                                type="number"
                                placeholder="Masukkan jumlah point"
                                value={points}
                                onChange={(e) => {
                                    setPoints(e.target.value);
                                    if (isNaN(parseFloat(e.target.value))) {
                                        setError('Harap masukkan angka yang valid');
                                    } else {
                                        setError('');
                                    }
                                }}
                                className={`${error && !points ? 'border-red-500' : 'border-gray-300'
                                    } transition-all duration-300 ease-in-out`}
                            />
                        </div>
                        <div>
                            <Label htmlFor="convertRatio">Rasio Konversi Point ke Token</Label>
                            <Input
                                id="convertRatio"
                                type="text"
                                placeholder="Contoh: 1:10"
                                value={convertRatio}
                                onChange={(e) => {
                                    setConvertRatio(e.target.value);
                                    if (isNaN(parseFloat(e.target.value))) {
                                        setError('Harap masukkan angka yang valid');
                                    } else {
                                        setError('');
                                    }
                                }}
                                className={`${error && !points ? 'border-red-500' : 'border-gray-300'
                                    } transition-all duration-300 ease-in-out`}
                            />
                        </div>
                        <div>
                            <Label htmlFor="tokenValue">Nilai Prediksi Token (USD)</Label>
                            <Input
                                id="tokenValue"
                                type="number"
                                placeholder="Masukkan nilai prediksi token"
                                value={tokenValue}
                                onChange={(e) => {
                                    setTokenValue(e.target.value);
                                    if (isNaN(parseFloat(e.target.value))) {
                                        setError('Harap masukkan angka yang valid');
                                    } else {
                                        setError('');
                                    }
                                }}
                                className={`${error && !points ? 'border-red-500' : 'border-gray-300'
                                    } transition-all duration-300 ease-in-out`}
                            />
                        </div>
                        <Button onClick={calculateAirdrop} className="w-full transition-transform transform hover:scale-105 active:scale-95">
                            Hitung
                        </Button>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mt-4 animate-pulse">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {result && (
                        <div className="mt-6 p-4 bg-green-100 rounded-lg transition-opacity duration-500 ease-in-out opacity-100">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">Hasil Perhitungan:</h3>
                            <p className="text-green-700">Jumlah Token: {result.tokens.toFixed(2)}</p>
                            <p className="text-green-700">Nilai Total (USD): ${result.valueUsd.toFixed(2)}</p>
                            <p className="text-green-700">Nilai Total (IDR): Rp {result.valueIdr.toLocaleString('id-ID')}</p>
                        </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Kurs USD ke IDR saat ini: 1 USD = Rp {usdToIdrRate ? usdToIdrRate.toFixed(2) : 'Memuat... '}
                        </p>
                        <Button
                            onClick={fetchExchangeRate}
                            disabled={isLoadingRate}
                            size="sm"
                            variant="outline"
                            className="flex items-center"
                        >
                            {isLoadingRate ? (
                                <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AirdropCalculator;