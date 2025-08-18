import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { 
  BookOpen, 
  Zap, 
  Server, 
  Code, 
  FileText, 
  Globe, 
  ChevronRight,
  Users,
  Key,
  Database,
  Shield,
  Rocket,
  Package,
  Github,
  Target,
  Lock,
  ArrowRight,
  Building,
  ArrowUpDown,
  Wrench,
  Folder,
  Cloud,
  Settings,
  Receipt,
  Truck,
  BarChart3,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useThemeStore } from '@/store/useThemeStore';

interface DocumentationSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Documentation = () => {
  const { theme } = useThemeStore();
  const [expandedSections, setExpandedSections] = useState<string[]>(['overview']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isExpanded = (sectionId: string) => expandedSections.includes(sectionId);

  const documentationSections: DocumentationSection[] = [
    {
      id: 'overview',
      title: 'Overview',
      icon: BookOpen,
      content: (
        <div className="space-y-6">
          <div className="text-lg text-muted-foreground leading-relaxed">
            Taameer ERP is a comprehensive enterprise resource planning system designed to streamline business operations, 
            manage inventory, handle sales processes, and provide real-time insights into business performance. 
            It provides a secure and efficient way to manage business processes, user access, and data across multiple modules.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Core Purpose</h3>
                </div>
                <p className="text-muted-foreground">
                  Centralized management of business operations with comprehensive inventory, sales, and financial tracking
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-success bg-gradient-to-r from-success/5 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-6 h-6 text-success" />
                  <h3 className="text-lg font-semibold text-foreground">Security First</h3>
                </div>
                <p className="text-muted-foreground">
                  Enterprise-grade security with JWT authentication and role-based access control
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'key-features',
      title: 'Key Features',
      icon: Zap,
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">User Management</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-8">
                  <li>• Role-based access control</li>
                  <li>• User status management</li>
                  <li>• Activity logging and monitoring</li>
                  <li>• Secure authentication system</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Security Features</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-8">
                  <li>• JWT token authentication</li>
                  <li>• Automatic token refresh</li>
                  <li>• Secure cookie handling</li>
                  <li>• HTTPS enforcement</li>
                </ul>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-success" />
                  <h3 className="text-lg font-semibold text-foreground">Business Management</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-8">
                  <li>• Inventory management</li>
                  <li>• Purchase order processing</li>
                  <li>• Sales and quotation management</li>
                  <li>• Financial reporting</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-success" />
                  <h3 className="text-lg font-semibold text-foreground">Data Protection</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-8">
                  <li>• Data encryption at rest</li>
                  <li>• Secure API endpoints</li>
                  <li>• Audit trail logging</li>
                  <li>• Backup and recovery</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Role-Based Access Control (RBAC)</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-warning" />
                  <h3 className="text-lg font-semibold text-foreground">User Roles</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-8">
                  <li>• <strong>ADMIN:</strong> Full system access</li>
                  <li>• <strong>Marketing_Officer:</strong> Sales & customer management</li>
                  <li>• <strong>Accounts:</strong> Financial & invoice management</li>
                  <li>• <strong>Warehouse:</strong> Inventory & delivery management</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-warning" />
                  <h3 className="text-lg font-semibold text-foreground">Module Access</h3>
                </div>
                <ul className="space-y-2 text-muted-foreground ml-8">
                  <li>• Dashboard & Reports</li>
                  <li>• Inventory Management</li>
                  <li>• Sales & Quotations</li>
                  <li>• User & System Settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'system-architecture',
      title: 'System Architecture',
      icon: Server,
      content: (
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Technology Stack</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-blue-700 dark:text-blue-300 text-base">Frontend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-blue-600 dark:text-blue-400">• React 19.1.1</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">• TypeScript 5.8.3</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">• Tailwind CSS 3.4.17</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">• Framer Motion 12.23.12</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-700 dark:text-green-300 text-base">Backend</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-green-600 dark:text-green-400">• RESTful API</div>
                  <div className="text-sm text-green-600 dark:text-green-400">• JWT Authentication</div>
                  <div className="text-sm text-green-600 dark:text-green-400">• Axios HTTP client</div>
                  <div className="text-sm text-green-600 dark:text-green-400">• React Query 5.83.0</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-700 dark:text-purple-300 text-base">Infrastructure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-purple-600 dark:text-purple-400">• Vite 7.1.2</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">• Zustand 5.0.7</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">• Radix UI Components</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">• Shadcn/ui</div>
                </CardContent>
              </Card>
            </div>
          </div>
          
                     <div className="space-y-6">
             <div className="flex items-center gap-3">
               <Package className="w-5 h-5 text-warning" />
               <h3 className="text-lg font-semibold text-foreground">Core Dependencies</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                 <CardHeader>
                   <CardTitle className="text-blue-700 dark:text-blue-300 text-base">UI & Styling</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   <div className="text-sm text-blue-600 dark:text-blue-400">• Radix UI Components</div>
                   <div className="text-sm text-blue-600 dark:text-blue-400">• Tailwind CSS 3.4.17</div>
                   <div className="text-sm text-blue-600 dark:text-blue-400">• Class Variance Authority</div>
                   <div className="text-sm text-blue-600 dark:text-blue-400">• Lucide React Icons</div>
                 </CardContent>
               </Card>
               
               <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                 <CardHeader>
                   <CardTitle className="text-green-700 dark:text-green-300 text-base">State & Data</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   <div className="text-sm text-green-600 dark:text-green-400">• Zustand 5.0.7</div>
                   <div className="text-sm text-green-600 dark:text-green-400">• React Query 5.83.0</div>
                   <div className="text-sm text-green-600 dark:text-green-400">• React Hook Form</div>
                   <div className="text-sm text-green-600 dark:text-green-400">• Zod Validation</div>
                 </CardContent>
               </Card>
             </div>
           </div>
           
           <div className="space-y-6">
             <div className="flex items-center gap-3">
               <Code className="w-5 h-5 text-info" />
               <h3 className="text-lg font-semibold text-foreground">Development Utilities</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                 <CardHeader>
                   <CardTitle className="text-purple-700 dark:text-purple-300 text-base">Build & Development</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   <div className="text-sm text-purple-600 dark:text-purple-400">• Vite 7.1.2</div>
                   <div className="text-sm text-purple-600 dark:text-purple-400">• TypeScript 5.8.3</div>
                   <div className="text-sm text-purple-600 dark:text-purple-400">• ESLint 9.32.0</div>
                   <div className="text-sm text-purple-600 dark:text-purple-400">• PostCSS & Autoprefixer</div>
                 </CardContent>
               </Card>
               
               <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                 <CardHeader>
                   <CardTitle className="text-orange-700 dark:text-orange-300 text-base">Additional Features</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   <div className="text-sm text-orange-600 dark:text-orange-400">• Framer Motion 12.23.12</div>
                   <div className="text-sm text-orange-600 dark:text-orange-400">• React Router DOM 7.8.1</div>
                   <div className="text-sm text-orange-600 dark:text-orange-400">• Date-fns 4.1.0</div>
                   <div className="text-sm text-orange-600 dark:text-orange-400">• jsPDF & AutoTable</div>
                 </CardContent>
               </Card>
             </div>
           </div>
           
           <div className="space-y-4">
             <div className="flex items-center gap-3">
               <ArrowUpDown className="w-5 h-5 text-info" />
               <h3 className="text-lg font-semibold text-foreground">Data Flow</h3>
             </div>
             
             <div className="space-y-4">
               <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                   1
                 </div>
                 <div>
                   <h4 className="font-medium text-foreground">Authentication</h4>
                   <p className="text-sm text-muted-foreground">User login with JWT token generation and validation</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                   2
                 </div>
                 <div>
                   <h4 className="font-medium text-foreground">Data Processing</h4>
                   <p className="text-sm text-muted-foreground">Business logic execution with role-based permissions</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                   3
                 </div>
                 <div>
                   <h4 className="font-medium text-foreground">State Management</h4>
                   <p className="text-sm text-muted-foreground">Centralized state with Zustand stores and React Query</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4">
                 <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                   4
                 </div>
                 <div>
                   <h4 className="font-medium text-foreground">UI Rendering</h4>
                   <p className="text-sm text-muted-foreground">Responsive interface with smooth animations and transitions</p>
                 </div>
               </div>
             </div>
           </div>
        </div>
      )
    },
    {
      id: 'business-workflows',
      title: 'Business Workflows',
      icon: ArrowUpDown,
      content: (
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Inventory Management Flow</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Product Creation</h4>
                  <p className="text-sm text-muted-foreground">Create products with codes, names, units, and pricing</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Purchase Orders</h4>
                  <p className="text-sm text-muted-foreground">Create POs with suppliers, products, and quantities</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-foreground">GRN Processing</h4>
                  <p className="text-sm text-muted-foreground">Receive goods and update stock levels</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Stock Management</h4>
                  <p className="text-sm text-muted-foreground">Monitor inventory levels and track movements</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-success" />
              <h3 className="text-lg font-semibold text-foreground">Sales Process Flow</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Quotation Creation</h4>
                  <p className="text-sm text-muted-foreground">Generate customer quotes with products and pricing</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Invoice Generation</h4>
                  <p className="text-sm text-muted-foreground">Convert quotations to invoices with payment terms</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Delivery Notes</h4>
                  <p className="text-sm text-muted-foreground">Create delivery notes for order fulfillment</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-success text-success-foreground flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Payment Tracking</h4>
                  <p className="text-sm text-muted-foreground">Monitor payment status and manage collections</p>
                </div>
              </div>
            </div>
          </div>

          
        </div>
      )
    },
    {
      id: 'api-documentation',
      title: 'API Documentation',
      icon: Code,
      content: (
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Wrench className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Authentication Endpoints</h3>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/user/login</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">User authentication with email and password</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> email, password
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-info">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/user/register</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create new user account</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> email, name, number, password, role
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Product Management</h3>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/product/all</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Fetch all products</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> None
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/product/register</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create new product</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Product data object (name, code, unit, price, etc.)
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/product/update</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Update existing product</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Product data object with ID
                  </div>
                </CardContent>
              </Card>
              
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Invoice Management</h3>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/invoice/all</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Fetch all invoices</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> None
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/invoice/create</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create invoice from quotation</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Quotation payload data
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-info">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/invoice/getinvoice</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Get invoice details by ID</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> invoice_id
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/invoice/invoicepayment/create</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create invoice payment (multipart/form-data)</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> FormData with payment details
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-info">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/invoice/refund/create</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create invoice refund</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Refund payload data
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Purchase Order Management</h3>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/purchases/list</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Fetch all purchase orders</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> None
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/create/purchases/orders</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create new purchase order</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Purchase order payload data
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-info">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/purchases/order/product/details</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Get purchase order details</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> purchase_id
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/purchases/payment</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Get purchase payments</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> purchase_id
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-info">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/purchases/payment/create</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create payment for purchase order</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Payment payload data (FormData or JSON)
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/purchases/order/stock/update</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Update stock quantities</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Stock update payload data
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/purchases/order/delete</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Delete purchase order</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> purchase_id
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/purchases/get_suppliers</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Get suppliers for purchase orders</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> None
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Receipt className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Quotation Management</h3>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/quotation/all</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Fetch all quotations</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> None
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/quotation/create</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create new quotation</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Quotation payload data
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/quotation/update</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Update existing quotation</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Updated quotation payload data
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-info">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/quotation/summary</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Get quotation summary</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> user_id (optional)
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/quaution/product/delete</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Delete product from quotation</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Product deletion payload data
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Delivery Note Management</h3>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/deliverynote/all</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Fetch all delivery notes</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> None
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/deliverynote/create</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create delivery note from invoice</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> Invoice payload data
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/deliverynote/update</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Update delivery quantity</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> product_id, new_delivered
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-info">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/deliverynote/completeddelivery</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Mark delivery note as completed</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> delivery_note_id
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/deliverynote/unloading</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Upload unloading image/comment (multipart/form-data)</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> image_path, comment, image_update_date, delivery_note_id
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/deliverynote/removeunloading</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Remove unloading image/comment</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> image_id
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">GRN Management</h3>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/grn/all</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Fetch all GRNs</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> None
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/grn/create</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create new GRN</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> GRN payload data
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">User & Supplier Management</h3>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/user/all</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Fetch all users</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> None
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      GET
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/supplier/all</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Fetch all suppliers</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> None
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/supplier/register</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Create new supplier</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> selectedOption, first_name, last_name, buiness_name, mobile_number, email, address_line_1, tax_number
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-warning">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/supplier/update</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Update supplier</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> id, selectedOption, first_name, last_name, buiness_name, mobile_number, email, address_line_1, tax_number
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      DELETE
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/supplier/{"{supplierId}"}</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Delete supplier</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> supplierId in URL path
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Reports & Analytics</h3>
            </div>
            
            <div className="space-y-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/invoice/reports/getinvoicebydaterange</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Get invoice reports by date range</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> first_date, last_date (YYYY-MM-DD format)
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-success">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      POST
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">/api/taameer/product/reports/productsales</code>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Get product sales report by date range</p>
                  <div className="text-xs text-muted-foreground">
                    <strong>Required Attributes:</strong> first_date, last_date (YYYY-MM-DD format)
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>


        </div>
      )
    },
    {
      id: 'setup-configuration',
      title: 'Setup & Configuration',
      icon: FileText,
      content: (
        <div className="space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-warning" />
              <h3 className="text-lg font-semibold text-foreground">Getting Started</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-foreground">1. Installation</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm font-mono text-foreground">npm install</code>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-foreground">2. Environment Configuration</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm font-mono text-foreground">VITE_API_BASE_URL=your_api_endpoint</code>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-lg font-medium text-foreground">3. Development Server</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm font-mono text-foreground">npm run dev</code>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-medium text-foreground">4. Build for Production</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm font-mono text-foreground">npm run build</code>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-medium text-foreground">5. Preview Production Build</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm font-mono text-foreground">npm run preview</code>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-info" />
              <h3 className="text-lg font-semibold text-foreground">Configuration Options</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Theme Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">• Light/Dark mode toggle</div>
                  <div className="text-sm text-muted-foreground">• RTL language support</div>
                  <div className="text-sm text-muted-foreground">• Custom color schemes</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">• JWT token expiration</div>
                  <div className="text-sm text-muted-foreground">• Session timeout</div>
                  <div className="text-sm text-muted-foreground">• Password policies</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )
    },
    
         {
       id: 'deployment-cicd',
       title: 'Deployment & CI/CD',
       icon: Globe,
       content: (
         <div className="space-y-8">
           {/* CI/CD Overview */}
           <div className="space-y-6">
             <div className="flex items-center gap-3">
               <Rocket className="w-5 h-5 text-primary" />
               <h3 className="text-lg font-semibold text-foreground">CI/CD Pipeline Overview</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-blue-700 dark:text-blue-300 text-base">Continuous Integration</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   <div className="text-sm text-blue-600 dark:text-blue-400">• Automated testing on every commit</div>
                   <div className="text-sm text-blue-600 dark:text-blue-400">• Code quality checks (ESLint, TypeScript)</div>
                   <div className="text-sm text-blue-600 dark:text-blue-400">• Build verification</div>
                   <div className="text-sm text-blue-600 dark:text-blue-400">• Security scanning</div>
                 </CardContent>
               </Card>
               
               <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-green-700 dark:text-green-300 text-base">Continuous Delivery</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   <div className="text-sm text-green-600 dark:text-green-400">• Automated deployment to staging</div>
                   <div className="text-sm text-green-600 dark:text-green-400">• Production deployment approval</div>
                   <div className="text-sm text-green-600 dark:text-green-400">• Environment management</div>
                   <div className="text-sm text-green-600 dark:text-green-400">• Rollback capabilities</div>
                 </CardContent>
               </Card>
               
               <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-purple-700 dark:text-purple-300 text-base">Monitoring & Feedback</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-2">
                   <div className="text-sm text-purple-600 dark:text-purple-400">• Deployment status tracking</div>
                   <div className="text-sm text-purple-600 dark:text-purple-400">• Performance metrics</div>
                   <div className="text-sm text-purple-600 dark:text-purple-400">• Error tracking & alerting</div>
                   <div className="text-sm text-purple-600 dark:text-purple-400">• User feedback collection</div>
                 </CardContent>
               </Card>
             </div>
           </div>

           {/* GitHub Actions Workflow */}
           <div className="space-y-6">
             <div className="flex items-center gap-3">
               <Github className="w-5 h-5 text-foreground" />
               <h3 className="text-lg font-semibold text-foreground">GitHub Actions Workflow</h3>
             </div>
             
             <div className="space-y-6">


               {/* Deployment Workflow */}
               <Card className="border-l-4 border-l-success">
                 <CardHeader>
                   <CardTitle className="text-base">Deployment Pipeline</CardTitle>
                   <p className="text-sm text-muted-foreground">Automated deployment to staging and production environments</p>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="bg-muted p-4 rounded-lg">
                     <h4 className="font-medium mb-2">Workflow File: .github/workflows/deploy.yml</h4>
                     <div className="space-y-3">
                       <div className="flex items-start gap-3">
                         <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                           Trigger
                         </Badge>
                         <code className="text-sm font-mono bg-background px-2 py-1 rounded">release: [published]</code>
                       </div>
                       <div className="flex items-start gap-3">
                         <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                           Environments
                         </Badge>
                         <code className="text-sm font-mono bg-background px-2 py-1 rounded">staging, production</code>
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-4">
                     <h4 className="font-medium">Deployment Stages:</h4>
                     <div className="space-y-3">
                       <div className="flex items-start gap-4">
                         <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                           A
                         </div>
                         <div>
                           <h5 className="font-medium">Staging Deployment</h5>
                           <p className="text-sm text-muted-foreground">Automatic deployment to staging environment for testing</p>
                           <div className="mt-2 text-xs text-muted-foreground">
                             <strong>URL:</strong> https://taameererpdev.gethorcrm.com/login
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex items-start gap-4">
                         <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                           B
                         </div>
                         <div>
                           <h5 className="font-medium">Production Deployment</h5>
                           <p className="text-sm text-muted-foreground">Manual approval required for production deployment</p>
                           <div className="mt-2 text-xs text-muted-foreground">
                             <strong>URL:</strong> https://taameererp.gethorcrm.com/login
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex items-start gap-4">
                         <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                           C
                         </div>
                         <div>
                           <h5 className="font-medium">Post-Deployment</h5>
                           <p className="text-sm text-muted-foreground">Health checks, monitoring setup, and rollback preparation</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>
           </div>

           {/* Environment Configuration */}
           <div className="space-y-6">
             <div className="flex items-center gap-3">
               <Settings className="w-5 h-5 text-warning" />
               <h3 className="text-lg font-semibold text-foreground">Environment Configuration</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <Card className="border-l-4 border-l-blue-500">
                 <CardHeader>
                   <CardTitle className="text-base">Staging Environment</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="text-sm">
                     <strong>Purpose:</strong> Testing and validation
                   </div>
                   <div className="text-sm">
                     <strong>Auto-deploy:</strong> Yes (on main branch)
                   </div>
                   <div className="text-sm">
                     <strong>Database:</strong> Staging DB (separate from production)
                   </div>
                   <div className="text-sm">
                     <strong>Features:</strong> All features enabled for testing
                   </div>
                 </CardContent>
               </Card>
               
               <Card className="border-l-4 border-l-green-500">
                 <CardHeader>
                   <CardTitle className="text-base">Production Environment</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-3">
                   <div className="text-sm">
                     <strong>Purpose:</strong> Live application
                   </div>
                   <div className="text-sm">
                     <strong>Auto-deploy:</strong> No (manual approval required)
                   </div>
                   <div className="text-sm">
                     <strong>Database:</strong> Production DB (live data)
                   </div>
                   <div className="text-sm">
                     <strong>Features:</strong> Stable features only
                   </div>
                 </CardContent>
               </Card>
             </div>
           </div>

           {/* Version Management */}
           <div className="space-y-6">
             <div className="flex items-center gap-3">
               <Package className="w-5 h-5 text-info" />
               <h3 className="text-lg font-semibold text-foreground">Version Management & Releases</h3>
             </div>
             
             <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
               <CardContent className="p-6">
                 <div className="space-y-4">
                   <div>
                     <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Semantic Versioning</h4>
                     <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
                       <li>• <strong>MAJOR</strong> (#major) - Breaking changes, incompatible API changes</li>
                       <li>• <strong>MINOR</strong> (#minor) - New features, backward compatible</li>
                       <li>• <strong>PATCH</strong> (#patch) - Bug fixes, backward compatible</li>
                     </ul>
                   </div>
                   
                   <div>
                     <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Release Process</h4>
                     <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
                       <li>• Create release branch from main</li>
                       <li>• Update version in package.json</li>
                       <li>• Create GitHub release with changelog</li>
                       <li>• Trigger automated deployment pipeline</li>
                       <li>• Monitor deployment and health checks</li>
                     </ul>
                   </div>
                   
                   <div>
                     <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Rollback Strategy</h4>
                     <ul className="space-y-1 text-sm text-purple-600 dark:text-purple-400">
                       <li>• Automatic rollback on deployment failure</li>
                       <li>• Manual rollback to previous stable version</li>
                       <li>• Database migration rollback support</li>
                       <li>• Zero-downtime rollback with blue-green deployment</li>
                     </ul>
                   </div>
                 </div>
               </CardContent>
             </Card>
           </div>

           
         </div>
       )
     }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={item} className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Documentation
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete guide to Taameer ERP System
          </p>
        </motion.div>

        <Separator className="my-8" />

        {/* Documentation Sections */}
        <div className="space-y-4">
          {documentationSections.map((section, index) => (
            <motion.div key={section.id} variants={item}>
              <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div
                  className="cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                          <section.icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl text-foreground">
                          {section.title}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: isExpanded(section.id) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </div>
                    </div>
                  </CardHeader>
                </div>

                <AnimatePresence>
                  {isExpanded(section.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <CardContent className="pt-0 pb-6">
                        <Separator className="mb-6" />
                        {section.content}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        
      </motion.div>
    </div>
  );
};
