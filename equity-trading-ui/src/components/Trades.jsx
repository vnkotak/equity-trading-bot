// src/components/Trades.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useSortBy, useGlobalFilter, useFilters } from '@tanstack/react-table';
import axios from 'axios';

const ColumnFilter = ({ column }) => {
  const { filterValue, setFilter } = column;
  return (
    <input
      value={filterValue || ''}
      onChange={(e) => setFilter(e.target.value)}
      placeholder={`Search...`}
      className="border p-1 text-xs w-full"
    />
  );
};

const Trades = ({ tab }) => {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    axios.get(`/trades-summary?status=${tab}`)
      .then((res) => {
        setData(res.data.trades);
        setSummary(res.data.summary);
      });
  }, [tab]);

  const columns = useMemo(() => {
    const base = [
      {
        Header: 'Ticker',
        accessor: 'ticker',
        Filter: ColumnFilter
      },
      {
        Header: 'Qty',
        accessor: 'quantity'
      },
      {
        Header: 'Buy Price',
        accessor: 'price'
      },
      {
        Header: tab === 'closed' ? 'Sell Price' : 'Current Price',
        accessor: 'sell_or_current_price'
      },
      {
        Header: 'Invested',
        accessor: 'total_invested'
      },
      {
        Header: 'Current Value',
        accessor: 'current_value'
      },
      {
        Header: 'Profit ₹',
        accessor: 'profit'
      },
      {
        Header: 'Profit %',
        accessor: 'profit_pct'
      },
      {
        Header: 'Reason',
        accessor: 'reason',
        Filter: ColumnFilter
      },
      {
        Header: 'Date',
        accessor: 'timestamp'
      }
    ];

    if (tab === 'all') {
      base.splice(1, 0, {
        Header: 'Status',
        accessor: 'status'
      });
    }

    return base;
  }, [tab]);

  const tableInstance = useTable({
    columns,
    data,
    initialState: { sortBy: [{ id: 'timestamp', desc: true }] },
    defaultColumn: { Filter: () => null }
  }, useFilters, useGlobalFilter, useSortBy);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = tableInstance;

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-2 capitalize">{tab} Trades</h2>
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="table-auto w-full text-sm border-collapse">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="p-2 border-b bg-gray-100 text-left w-32">
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="odd:bg-white even:bg-gray-50 hover:bg-yellow-50">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="p-2 border-b text-left">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {summary && (
        <div className="mt-4 bg-gray-50 p-3 rounded shadow text-sm">
          <p>📊 Total Invested: ₹{summary.total_invested.toFixed(2)} | Current Value: ₹{summary.current_value.toFixed(2)}</p>
          <p>💰 Profit: ₹{summary.profit.toFixed(2)} ({summary.profit_pct.toFixed(2)}%)</p>
          <p>📈 Trades: {summary.total_buy_trades} | Open: {summary.open_trades} | Closed: {summary.closed_trades} | Winning %: {summary.winning_pct}%</p>
        </div>
      )}
    </div>
  );
};

export default Trades;
