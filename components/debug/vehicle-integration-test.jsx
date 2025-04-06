// components/debug/vehicle-integration-test.jsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/use-toast";
import api from "@/lib/api";

export function VehicleIntegrationTest() {
  const { toast } = useToast();
  const [testStatus, setTestStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const runIntegrationTest = async () => {
    setLoading(true);
    try {
      // Test fetching vehicles
      const vehiclesResponse = await api.get('/vehicles');
      
      // Output results
      setTestStatus({
        success: true,
        message: 'API Integration working correctly!',
        data: {
          vehiclesCount: vehiclesResponse.data.data.length
        }
      });
      
      toast({
        title: "Test Successful",
        description: "Backend API integration working correctly",
        variant: "success"
      });
    } catch (error) {
      console.error('Integration test failed:', error);
      
      setTestStatus({
        success: false,
        message: 'API Integration test failed!',
        error: error.response?.data?.message || error.message
      });
      
      toast({
        title: "Test Failed",
        description: error.response?.data?.message || error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle API Integration Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={runIntegrationTest} disabled={loading}>
            {loading ? "Testing..." : "Run Integration Test"}
          </Button>
          
          {testStatus && (
            <div className={`p-4 rounded-md ${testStatus.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              <p className="font-medium">{testStatus.message}</p>
              {testStatus.success ? (
                <pre className="mt-2 text-sm bg-white p-2 rounded border">
                  {JSON.stringify(testStatus.data, null, 2)}
                </pre>
              ) : (
                <p className="mt-2 text-sm">{testStatus.error}</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
