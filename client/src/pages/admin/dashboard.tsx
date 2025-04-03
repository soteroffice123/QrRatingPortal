import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ThumbsUp, Star, CheckCircle } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <ThumbsUp className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-700">QR Scans</h3>
                <p className="mt-1 text-3xl font-bold text-gray-900">{analytics?.totalScans || 0}</p>
                {analytics?.scansOverTime && (
                  <p className="mt-1 text-sm text-green-600">
                    ↑ {Object.values(analytics.scansOverTime)[0]} today
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                <Star className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-700">Avg Rating</h3>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {analytics?.ratingDistribution 
                    ? (
                        (analytics.ratingDistribution[1] +
                        analytics.ratingDistribution[2] * 2 +
                        analytics.ratingDistribution[3] * 3 +
                        analytics.ratingDistribution[4] * 4 +
                        analytics.ratingDistribution[5] * 5) /
                        (analytics.ratingsSubmitted || 1)
                      ).toFixed(1)
                    : "0.0"
                  }
                </p>
                <p className="mt-1 text-sm text-green-600">Based on {analytics?.ratingsSubmitted || 0} ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-700">5-Star Reviews</h3>
                <p className="mt-1 text-3xl font-bold text-gray-900">{analytics?.fiveStarRatings || 0}</p>
                <p className="mt-1 text-sm text-green-600">
                  {analytics?.ratingsSubmitted 
                    ? `${Math.round((analytics.fiveStarRatings / analytics.ratingsSubmitted) * 100)}% of all ratings`
                    : "No ratings yet"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h3>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Destination</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
                  analytics.recentActivity.map((activity: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(activity.scanDate), "MMM d, yyyy - HH:mm")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        QR Scan
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        {activity.rating ? `${activity.rating} stars` : "No rating"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        {activity.destination === "google_review" 
                          ? "Google Reviews" 
                          : activity.destination === "feedback_form" 
                            ? "Feedback Form" 
                            : "Not submitted"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                      No activity recorded yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
