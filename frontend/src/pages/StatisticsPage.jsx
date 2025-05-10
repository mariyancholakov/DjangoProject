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

  const categoryChartData = {
    labels: categoryData.map((item) => item.category),
    datasets: [
      {
        data: categoryData.map((item) => item.total_amount),
        backgroundColor: [
          "rgb(255, 99, 132)",
          "rgb(224, 224, 224)",
          "rgb(54, 162, 235)",
          "rgb(255, 205, 86)",
        ],
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
      <div className="flex justify-center gap-30 items-center mb-10">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Expenses Statistics</h1>
          <div>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="py-2 pr-4 pl-1 border-2 shadow-md shadow-blue-600/30 focus:shadow-blue-500/50 outline-none border-[#007BFF] rounded-md"
            >
              <option value="day">Daily</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
        </div>
        <div className="text-xl font-semibold">
          Total Spend:{" "}
          <span className="text-[#007BFF] font-bold">
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
