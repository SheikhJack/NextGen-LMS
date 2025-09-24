"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Save,
  CreditCard,
  Receipt,
  Banknote,
  Percent,
  Calendar,
  Building,
  Shield,
  Download,
  Upload
} from "lucide-react";

interface FinanceSettings {
  paymentMethods: {
    cash: boolean;
    bankTransfer: boolean;
    card: boolean;
    mobileMoney: boolean;
  };
  taxSettings: {
    enabled: boolean;
    rate: number;
    number: string;
  };
  invoiceSettings: {
    prefix: string;
    nextNumber: number;
    dueDays: number;
    lateFeeEnabled: boolean;
    lateFeeRate: number;
  };
  financialYear: {
    startMonth: number;
    startDay: number;
  };
  currency: string;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    branchCode: string;
  };
}

export default function FinanceSettingsPage() {
  const [settings, setSettings] = useState<FinanceSettings>({
    paymentMethods: {
      cash: true,
      bankTransfer: true,
      card: true,
      mobileMoney: true
    },
    taxSettings: {
      enabled: false,
      rate: 15,
      number: ""
    },
    invoiceSettings: {
      prefix: "INV",
      nextNumber: 1001,
      dueDays: 30,
      lateFeeEnabled: true,
      lateFeeRate: 5
    },
    financialYear: {
      startMonth: 0, // January
      startDay: 1
    },
    currency: "USD",
    bankAccount: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      branchCode: ""
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulate loading settings from API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert("Settings saved successfully!");
    }, 1000);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', 'finance-settings-backup.json');
    link.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          alert("Settings imported successfully!");
        } catch (error) {
          alert("Error importing settings. Please check the file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Finance Settings</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" asChild>
            <label>
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Enable or disable available payment methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="cash-payment"
                checked={settings.paymentMethods.cash}
                onCheckedChange={(checked: any) =>
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: { ...prev.paymentMethods, cash: checked }
                  }))
                }
              />
              <Label htmlFor="cash-payment" className="flex items-center">
                <Banknote className="w-4 h-4 mr-2" />
                Cash Payments
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="bank-transfer"
                checked={settings.paymentMethods.bankTransfer}
                onCheckedChange={(checked: any) =>
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: { ...prev.paymentMethods, bankTransfer: checked }
                  }))
                }
              />
              <Label htmlFor="bank-transfer" className="flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Bank Transfer
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="card-payment"
                checked={settings.paymentMethods.card}
                onCheckedChange={(checked: any) =>
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: { ...prev.paymentMethods, card: checked }
                  }))
                }
              />
              <Label htmlFor="card-payment" className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Credit/Debit Card
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="mobile-money"
                checked={settings.paymentMethods.mobileMoney}
                onCheckedChange={(checked: any) =>
                  setSettings(prev => ({
                    ...prev,
                    paymentMethods: { ...prev.paymentMethods, mobileMoney: checked }
                  }))
                }
              />
              <Label htmlFor="mobile-money" className="flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Mobile Money
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Percent className="w-5 h-5 mr-2" />
            Tax Settings
          </CardTitle>
          <CardDescription>
            Configure tax rates and VAT settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="tax-enabled"
                checked={settings.taxSettings.enabled}
                onCheckedChange={(checked: any) =>
                  setSettings(prev => ({
                    ...prev,
                    taxSettings: { ...prev.taxSettings, enabled: checked }
                  }))
                }
              />
              <Label htmlFor="tax-enabled">Enable Tax Calculation</Label>
            </div>

            {settings.taxSettings.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    value={settings.taxSettings.rate}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        taxSettings: { ...prev.taxSettings, rate: Number(e.target.value) }
                      }))
                    }
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="tax-number">Tax Number</Label>
                  <Input
                    id="tax-number"
                    value={settings.taxSettings.number}
                    onChange={(e) =>
                      setSettings(prev => ({
                        ...prev,
                        taxSettings: { ...prev.taxSettings, number: e.target.value }
                      }))
                    }
                    placeholder="VAT/Tax Identification Number"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            Invoice Settings
          </CardTitle>
          <CardDescription>
            Configure invoice numbering and payment terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="invoice-prefix">Invoice Prefix</Label>
              <Input
                id="invoice-prefix"
                value={settings.invoiceSettings.prefix}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    invoiceSettings: { ...prev.invoiceSettings, prefix: e.target.value }
                  }))
                }
                placeholder="INV"
              />
            </div>

            <div>
              <Label htmlFor="next-invoice-number">Next Invoice Number</Label>
              <Input
                id="next-invoice-number"
                type="number"
                value={settings.invoiceSettings.nextNumber}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    invoiceSettings: { ...prev.invoiceSettings, nextNumber: Number(e.target.value) }
                  }))
                }
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="due-days">Payment Due Days</Label>
              <Input
                id="due-days"
                type="number"
                value={settings.invoiceSettings.dueDays}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    invoiceSettings: { ...prev.invoiceSettings, dueDays: Number(e.target.value) }
                  }))
                }
                min="1"
                max="90"
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) =>
                  setSettings(prev => ({ ...prev, currency: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="ZAR">ZAR (R)</option>
                <option value="KES">KES (KSh)</option>
                <option value="NGN">NGN (₦)</option>
                <option value="PUL">NGN (P)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="late-fee"
                checked={settings.invoiceSettings.lateFeeEnabled}
                onCheckedChange={(checked: any) =>
                  setSettings(prev => ({
                    ...prev,
                    invoiceSettings: { ...prev.invoiceSettings, lateFeeEnabled: checked }
                  }))
                }
              />
              <Label htmlFor="late-fee">Enable Late Payment Fee</Label>
            </div>

            {settings.invoiceSettings.lateFeeEnabled && (
              <div>
                <Label htmlFor="late-fee-rate">Late Fee Rate (%)</Label>
                <Input
                  id="late-fee-rate"
                  type="number"
                  value={settings.invoiceSettings.lateFeeRate}
                  onChange={(e) =>
                    setSettings(prev => ({
                      ...prev,
                      invoiceSettings: { ...prev.invoiceSettings, lateFeeRate: Number(e.target.value) }
                    }))
                  }
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Bank Account Details
          </CardTitle>
          <CardDescription>
            School bank account information for payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="bank-name">Bank Name</Label>
              <Input
                id="bank-name"
                value={settings.bankAccount.bankName}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, bankName: e.target.value }
                  }))
                }
                placeholder="Bank Name"
              />
            </div>

            <div>
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                value={settings.bankAccount.accountNumber}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, accountNumber: e.target.value }
                  }))
                }
                placeholder="Account Number"
              />
            </div>

            <div>
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                value={settings.bankAccount.accountName}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, accountName: e.target.value }
                  }))
                }
                placeholder="Account Holder Name"
              />
            </div>

            <div>
              <Label htmlFor="branch-code">Branch Code</Label>
              <Input
                id="branch-code"
                value={settings.bankAccount.branchCode}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    bankAccount: { ...prev.bankAccount, branchCode: e.target.value }
                  }))
                }
                placeholder="Branch Code"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Year */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Financial Year Settings
          </CardTitle>
          <CardDescription>
            Set your organization&apos;s financial year start date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="start-month">Start Month</Label>
              <select
                id="start-month"
                value={settings.financialYear.startMonth}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    financialYear: { ...prev.financialYear, startMonth: Number(e.target.value) }
                  }))
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value={0}>January</option>
                <option value={1}>February</option>
                <option value={2}>March</option>
                <option value={3}>April</option>
                <option value={4}>May</option>
                <option value={5}>June</option>
                <option value={6}>July</option>
                <option value={7}>August</option>
                <option value={8}>September</option>
                <option value={9}>October</option>
                <option value={10}>November</option>
                <option value={11}>December</option>
              </select>
            </div>

            <div>
              <Label htmlFor="start-day">Start Day</Label>
              <Input
                id="start-day"
                type="number"
                value={settings.financialYear.startDay}
                onChange={(e) =>
                  setSettings(prev => ({
                    ...prev,
                    financialYear: { ...prev.financialYear, startDay: Number(e.target.value) }
                  }))
                }
                min="1"
                max="31"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg" disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving Changes..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  );
}