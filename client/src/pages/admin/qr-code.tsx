import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Download, Printer } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { QRCodeSVG } from "qrcode.react";
import { generateQrUrl } from "@/lib/qr-utils";
import * as React from "react";
import { useRef } from "react";

const formSchema = z.object({
  size: z.string().min(1),
  fgColor: z.string().min(1),
  bgColor: z.string().min(1),
  errorCorrection: z.string().min(1),
  logoEnabled: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function QrCodeGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const qrRef = useRef<HTMLDivElement>(null);
  
  const { data: business } = useQuery({
    queryKey: ["/api/business"],
  });
  
  const { data: qrCode, isLoading } = useQuery({
    queryKey: ["/api/qrcode"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        if (res.status === 404) {
          return {
            size: 300,
            fgColor: "#000000",
            bgColor: "#FFFFFF",
            errorCorrection: "M",
            logoEnabled: true
          };
        }
        return await res.json();
      } catch (error) {
        return {
          size: 300,
          fgColor: "#000000",
          bgColor: "#FFFFFF",
          errorCorrection: "M",
          logoEnabled: true
        };
      }
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: qrCode?.size?.toString() || "300",
      fgColor: qrCode?.fgColor || "#000000",
      bgColor: qrCode?.bgColor || "#FFFFFF",
      errorCorrection: qrCode?.errorCorrection || "M",
      logoEnabled: qrCode?.logoEnabled ?? true,
    },
  });

  // Update form values when qrCode data is loaded
  React.useEffect(() => {
    if (qrCode) {
      form.reset({
        size: qrCode.size?.toString() || "300",
        fgColor: qrCode.fgColor || "#000000",
        bgColor: qrCode.bgColor || "#FFFFFF",
        errorCorrection: qrCode.errorCorrection || "M",
        logoEnabled: qrCode.logoEnabled ?? true,
      });
    }
  }, [qrCode, form]);

  const updateQrCodeMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        ...data,
        size: parseInt(data.size),
      };
      const res = await apiRequest("POST", "/api/qrcode", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qrcode"] });
      toast({
        title: "QR Code updated",
        description: "Your QR code settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    updateQrCodeMutation.mutate(data);
  };

  const handleDownloadPNG = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = parseInt(form.getValues('size'));
      canvas.height = parseInt(form.getValues('size'));
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = 'qrcode.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };
  
  const handleDownloadSVG = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.download = 'qrcode.svg';
    downloadLink.href = svgUrl;
    downloadLink.click();
    
    URL.revokeObjectURL(svgUrl);
  };
  
  const handlePrint = () => {
    if (!qrRef.current) return;
    
    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              height: 100vh; 
              margin: 0;
            }
            img { max-width: 80%; max-height: 80%; }
            @media print {
              @page { margin: 0; }
              body { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <img src="data:image/svg+xml;base64,${btoa(svgData)}" />
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">QR Code Generator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">QR Code Settings</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>QR Code Size</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="200">Small (200x200)</SelectItem>
                          <SelectItem value="300">Medium (300x300)</SelectItem>
                          <SelectItem value="400">Large (400x400)</SelectItem>
                          <SelectItem value="500">Extra Large (500x500)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foreground Color</FormLabel>
                      <div className="flex items-center">
                        <FormControl>
                          <div className="flex items-center">
                            <input 
                              type="color" 
                              className="h-10 w-10 border border-gray-300 rounded" 
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                            <Input 
                              className="ml-2 flex-1" 
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bgColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <div className="flex items-center">
                        <FormControl>
                          <div className="flex items-center">
                            <input 
                              type="color" 
                              className="h-10 w-10 border border-gray-300 rounded" 
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                            <Input 
                              className="ml-2 flex-1" 
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="errorCorrection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Error Correction Level</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an error correction level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="L">Low (7%)</SelectItem>
                          <SelectItem value="M">Medium (15%)</SelectItem>
                          <SelectItem value="Q">Quartile (25%)</SelectItem>
                          <SelectItem value="H">High (30%)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="logoEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Add Logo to QR Code</FormLabel>
                        <FormDescription>
                          Add business logo to center of QR code
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="mt-6"
                  disabled={updateQrCodeMutation.isPending}
                >
                  {updateQrCodeMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate QR Code
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Preview</h3>
            
            <div className="relative mb-4" ref={qrRef}>
              {qrCode && (
                <div className="qr-wrapper">
                  <QRCodeSVG
                    value={generateQrUrl(qrCode.id)}
                    size={parseInt(form.getValues("size"))}
                    bgColor={form.getValues("bgColor")}
                    fgColor={form.getValues("fgColor")}
                    level={form.getValues("errorCorrection") as "L" | "M" | "Q" | "H"}
                    imageSettings={
                      form.getValues("logoEnabled") && business?.logoUrl
                      ? {
                          src: business.logoUrl,
                          excavate: true,
                          width: parseInt(form.getValues("size")) * 0.2,
                          height: parseInt(form.getValues("size")) * 0.2,
                        }
                      : undefined
                    }
                  />
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleDownloadPNG}
                disabled={!qrCode}
              >
                <Download className="mr-2 h-4 w-4" />
                Download PNG
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadSVG}
                disabled={!qrCode}
              >
                <Download className="mr-2 h-4 w-4" />
                Download SVG
              </Button>
              <Button 
                variant="outline" 
                onClick={handlePrint}
                disabled={!qrCode}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
