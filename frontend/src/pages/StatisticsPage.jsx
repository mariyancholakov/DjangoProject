import React, { useState, useEffect } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axiosInstance from "../utils/axios";
import { ClipLoader } from "react-spinners";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function StatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");
  const [timeData, setTimeData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/statistics/?period=${period}`);
      setTimeData(response.data.time_based);
      setCategoryData(response.data.category_based);

      const total = response.data.time_based.reduce(
        (sum, item) => sum + item.total_amount,
        0
      );
      setTotalSpend(total);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPeriodLabel = (period, periodType) => {
    switch (periodType) {
      case "month": {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months[period - 1];
      }
      case "day":
        return `Day ${period}`;
      case "year":
        return `${period}`;
      default:
        return period;
    }
  };

  const timeChartData = {
    labels: timeData.map((item) => formatPeriodLabel(item.period, period)),
    datasets: [
      {
        label: "Total Expenses (BGN)",
        data: timeData.map((item) => item.total_amount),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
        fill: true,
        backgroundColor: "rgba(75, 192, 192, 0.1)",
      },
    ],
  };

  const categoryColors = {
    food: "rgba(90, 240, 120, 1)",
    electronics: "rgba(72, 156, 250, 1)",
    clothing: "rgba(96, 72, 250, 1)",
    home: "rgba(249, 168, 52, 1)",
    pharmacy: "rgba(245, 101, 101, 1)",
    transport: "rgba(88, 223, 217, 1)",
    entertainment: "rgba(233, 44, 93, 1)",
    education: "rgba(119, 135, 218, 1)",
    utilities: "rgba(203, 236, 40, 1)",
    services: "rgba(69, 109, 208, 1)",
    finances: "rgba(250, 214, 14, 1)",
    other: "rgba(160, 174, 192, 1)",
  };

  const categoryChartData = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        data: categoryData.map((item) => item.total_amount),
        backgroundColor: categoryData.map(
          (item) => categoryColors[item.category] || categoryColors.other
        ),
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
  };

  return (
    <div className="px-8 py-8">
      <div className="flex justify-between px-10 gap-30 items-center mb-10">
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="shadow-md bg-white/50 shadow-blue-600/30 focus:shadow-blue-500/50 placeholder:text-gray-600 outline-none rounded-full h-10 w-60 px-4 cursor-pointer"
          >
            <option value="day">Daily</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>
        <div className="text-xl font-semibold">
          Total Spend:{" "}
          <span className="text-blue-600 font-extrabold">
            {totalSpend.toFixed(2)} BGN
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <ClipLoader color="#007BFF" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Time-based Expenses</h2>
            <div className="h-[300px]">
              {" "}
              <Line data={timeChartData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Category-based Expenses
            </h2>
            <div className="h-[300px]">
              {" "}
              <Doughnut data={categoryChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatisticsPage;
