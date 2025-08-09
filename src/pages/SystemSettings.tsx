import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Building, Palette, Globe, DollarSign, Upload, Phone, MapPin, FileText, ToggleLeft, Monitor, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSystemStore } from '@/store/useSystemStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useToast } from '@/hooks/use-toast';

export const SystemSettings = () => {
  const { settings, updateSettings } = useSystemStore();
  const { setRTL } = useThemeStore();
  const { toast } = useToast();
  
  const defaultModules = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory/products', label: 'Products' },
    { id: 'inventory/purchase-orders', label: 'Purchase Orders' },
    { id: 'inventory/stock', label: 'Stock Management' },
    { id: 'sales/quotations', label: 'Quotations' },
    { id: 'sales/invoices', label: 'Invoices' },
    { id: 'sales/delivery-notes', label: 'Delivery Notes' },
    { id: 'customers/customers', label: 'Customers' },
    { id: 'customers/suppliers', label: 'Suppliers' },
    { id: 'reports', label: 'Reports' },
    { id: 'users', label: 'User Management' },
    { id: 'settings', label: 'System Settings' }
  ];

  const [tempSettings, setTempSettings] = useState({
    companyName: '',
    companySlogan: '',
    companyAddress: '',
    companyEmail: '',
    crNumber: '',
    vatRegNumber: '',
    vatPercentage: undefined as any,
    primaryColor: '',
    secondaryColor: '',
    fontFamily: '',
    themeMode: '',
    logoPlacement: '',
    language: '',
    currency: '',
    dateFormat: '',
    timeFormat: '',
    enabledModules: [] as string[],
  });

  const handleSave = () => {
    toast({
      title: "Info",
      description: "System settings save will be available when API is fully implemented.",
      variant: "info",
    });
  };

  const handleModuleToggle = (moduleId: string, enabled: boolean) => {
    setTempSettings(prev => ({
      ...prev,
      enabledModules: enabled 
        ? [...(prev.enabledModules || []), moduleId]
        : (prev.enabledModules || []).filter(m => m !== moduleId)
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">Configure system preferences and appearance (This feature is coming soon)</p>
      </motion.div>
      
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-15">
          <TabsTrigger value="company" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50 transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium h-10">Company</TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50 transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium h-10">Appearance</TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50 transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium h-10">Localization</TabsTrigger>
          <TabsTrigger value="features" className="flex items-center justify-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm data-[state=active]:font-medium data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent/50 transition-all duration-300 rounded-lg px-4 py-2 text-sm font-medium h-10">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Update your company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={tempSettings.companyName}
                    onChange={() => {}}
                    placeholder=""
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-slogan">Company Slogan</Label>
                  <Input
                    id="company-slogan"
                    value={tempSettings.companySlogan}
                    onChange={() => {}}
                    placeholder=""
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-address">Company Address</Label>
                  <Textarea
                  id="company-address"
                    value={tempSettings.companyAddress}
                    onChange={() => {}}
                    placeholder=""
                    disabled
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email Address</Label>
                  <Input
                    id="company-email"
                    type="email"
                    value={tempSettings.companyEmail}
                    onChange={() => {}}
                    placeholder=""
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cr-number">CR Number</Label>
                  <Input
                    id="cr-number"
                    value={tempSettings.crNumber}
                    onChange={() => {}}
                    placeholder=""
                    disabled
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vat-reg-number">VAT Registration Number</Label>
                  <Input
                    id="vat-reg-number"
                    value={tempSettings.vatRegNumber}
                    onChange={() => {}}
                    placeholder=""
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vat-percentage">VAT Percentage (%)</Label>
                  <Input
                    id="vat-percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={tempSettings.vatPercentage}
                    onChange={() => {}}
                    placeholder=""
                    disabled
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Company Logo</Label>
                <Button variant="outline" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Logo (Dummy)
                </Button>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 200x80px, PNG or JPG format
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={tempSettings.primaryColor}
                      onChange={() => {}}
                      className="w-20 h-10 p-1 border rounded"
                      disabled
                    />
                    <Input
                      value={tempSettings.primaryColor}
                      onChange={() => {}}
                      placeholder=""
                      className="flex-1"
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondary-color"
                      type="color"
                      value={tempSettings.secondaryColor}
                      onChange={() => {}}
                      className="w-20 h-10 p-1 border rounded"
                      disabled
                    />
                    <Input
                      value={tempSettings.secondaryColor}
                      onChange={() => {}}
                      placeholder=""
                      className="flex-1"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select value={tempSettings.fontFamily} onValueChange={() => {}} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Nunito">Nunito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme-mode">Theme Mode</Label>
                  <Select value={tempSettings.themeMode} onValueChange={() => {}} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light Mode
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark Mode
                        </div>
                      </SelectItem>
                      <SelectItem value="auto">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          Auto (System)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-placement">Logo Placement</Label>
                  <Select value={tempSettings.logoPlacement} onValueChange={() => {}} disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Localization Settings
              </CardTitle>
              <CardDescription>Configure language and regional settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={tempSettings.language} onValueChange={() => {}} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="ar">🇴🇲 العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={tempSettings.currency} onValueChange={() => {}} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OMR">OMR - Omani Rial</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                      <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                      <SelectItem value="KWD">KWD - Kuwaiti Dinar</SelectItem>
                      <SelectItem value="BHD">BHD - Bahraini Dinar</SelectItem>
                      <SelectItem value="QAR">QAR - Qatari Riyal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select value={tempSettings.dateFormat} onValueChange={() => {}} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select value={tempSettings.timeFormat} onValueChange={() => {}} disabled>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5" />
                Feature Toggles
              </CardTitle>
              <CardDescription>Enable or disable specific modules and features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {defaultModules.map((module) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{module.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {module.id.includes('/') ? 'Sub-module' : 'Main module'}
                      </div>
                    </div>
                    <Switch checked={false} onCheckedChange={() => {}} disabled />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end"
      >
        <Button onClick={handleSave} className="px-8 hover:scale-105 transition-all duration-200">
          Save Changes
        </Button>
      </motion.div>
    </div>
  );
};