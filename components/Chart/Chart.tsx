import { FC } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie, Doughnut } from "react-chartjs-2";
import { PieChartData } from "../../types/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  data: PieChartData;
  title: string;
}

const PieChart: FC<PieChartProps> = ({ data, title }) => {
  if (!data) return null;

  return (
    <section className="flex flex-col justify-center items-center my-12 mx-10 bg-gray-50">
      <h1 className="font-bold text-lg text-gray-900 mb-2">{title}</h1>
      <Doughnut
        data={data}
        options={{
          responsive: true,
        }}
      />
    </section>
  );
};

export default PieChart;
