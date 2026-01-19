import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { createInstance, connectInstance } from "@/services/apiWhatsapp";

const Settings = () => {
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleConnectWhatsapp = async () => {
    try {
      setIsLoading(true);
      const instanceName = "Personal";
      await createInstance(instanceName);
      const base64 = await connectInstance(instanceName);
      setQrBase64(base64);
      localStorage.setItem("whatsapp_instance_name", instanceName);
      toast({ title: "WhatsApp", description: "Instância criada. Leia o QR Code para conectar." });
    } catch (error) {
      toast({ title: "Erro ao conectar WhatsApp", description: "Verifique o servidor Evolution API (porta 8082).", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-subtle-gradient p-6">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <Card className="card-fitness">
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleConnectWhatsapp} disabled={isLoading} className="btn-fitness">
              {isLoading ? "Conectando..." : "Conectar WhatsApp"}
            </Button>

            {qrBase64 && (
              <div className="mt-4 flex justify-center">
                <img
                  src={`data:image/png;base64,${qrBase64}`}
                  alt="QR Code WhatsApp"
                  className="border border-border rounded-lg"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

