import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend 
} from "recharts";

export default function Analytics() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Transform rating distribution for chart display
  const ratingData = analytics?.ratingDistribution 
    ? Object.entries(analytics.ratingDistribution).map(([rating, count]) => ({
        rating: `${rating}★`,
        count,
        fill: getRatingColor(parseInt(rating))
      }))
    : [];

  // Transform scans over time for chart display
  const scansData = analytics?.scansOverTime 
    ? Object.entries(analytics.scansOverTime)
        .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
        .map(([date, count]) => ({
          date: new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          scans: count
        }))
    : [];

  function getRatingColor(rating: number): string {
    switch(rating) {
      case 1: return '#ef4444'; // Red
      case 2: return '#f97316'; // Orange
      case 3: return '#facc15'; // Yellow
      case 4: return '#84cc16'; // Lime Green
      case 5: return '#22c55e'; // Green
      default: return '#cbd5e1'; // Slate
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Rating Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ratingData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} ratings`, 'Count']}
                    labelFormatter={(label) => `${label} Stars`}
                  />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Scans Over Time</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={scansData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="scans" 
                    stroke="#3b82f6" 
                    activeDot={{ r: 8 }} 
                    name="QR Scans" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Conversion Rate</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500">QR Code Scans</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-800">
                {analytics?.totalScans || 0}
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500">Ratings Submitted</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-800">
                {analytics?.ratingsSubmitted || 0}
              </p>
              {analytics?.totalScans > 0 && (
                <p className="text-sm text-gray-500">
                  {Math.round((analytics.ratingsSubmitted / analytics.totalScans) * 100)}% completion rate
                </p>
              )}
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500">Google Reviews</h4>
              <p className="mt-2 text-3xl font-semibold text-gray-800">
                {analytics?.fiveStarRatings || 0}
              </p>
              {analytics?.ratingsSubmitted > 0 && (
                <p className="text-sm text-gray-500">
                  {Math.round((analytics.fiveStarRatings / analytics.ratingsSubmitted) * 100)}% of all ratings
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
