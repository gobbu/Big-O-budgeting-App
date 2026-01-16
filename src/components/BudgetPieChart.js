// BudgetPieChart.js
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const BudgetPieChart = ({ spent, budget }) => {
  // Calculate the remaining budget
  const remaining = budget - spent;

  // Data for the pie chart
  const data = [
    { name: 'Spent', value: spent },
    { name: 'Remaining', value: remaining > 0 ? remaining : 0 },
  ];

  // Colors for the pie segments
  const COLORS = ['#FF6384', '#36A2EB']; // Red for spent, green for remaining

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
        fill="#8884d8"
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="bottom" height={36} />
    </PieChart>
  );
};

export default BudgetPieChart;
