import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HelpScreen = () => {
  return (
    <Layout>
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Help Center</CardTitle>
            <CardDescription>Find answers and support resources</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Help center will be implemented in Phase 4</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default HelpScreen;
