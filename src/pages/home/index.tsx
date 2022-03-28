import { FC, ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Badge } from 'antd';
import React from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { IReport } from "../../constant/typings";
const { ipcRenderer } = window.require("electron");

interface IListData {
    type: "warning" | "success" | "error" | "processing" | "default",
    content: string
}

const Home: FC = (): ReactElement => {
    const [response, setResponse] = useState<IReport[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        ipcRenderer.invoke("get", "/reports", localStorage.getItem("token"))
            .then(response => {
                if (response.code === 200) {
                    setResponse(Object.values(response.result));
                } else if (response.code === 401) {
                    localStorage.removeItem("token");
                    ipcRenderer.send("goto login page");
                    navigate("/login");
                }
            })
    }, [])

    const monthTotal: Map<string, number> = useMemo(() => {
        const map = new Map<string, number>();
        for (let each of response) {
            const prefix = each.createdAt.substring(0, 7);
            if (map.has(prefix)) {
                map.set(prefix, map.get(prefix) + 1)
            } else {
                map.set(prefix, 1);
            }
        }
        return map;
    }, [response])

    const getListData = useCallback((value: moment.Moment) => {
        let listData: IListData[] = [];
        const currentDate = value.format('YYYY-MM-DD');
        for (let each of response) {
            if (each.createdAt.substring(0, 10) === currentDate) {
                if (each.finish) {
                    listData.push({
                        type: 'success',
                        content: each.finish
                    })
                }
                if (each.unfinish) {
                    listData.push({
                        type: 'error',
                        content: each.unfinish
                    })
                }
                return listData;
            }
        }
        return listData;
    }, [response])

    const dateCellRender = useCallback((value: moment.Moment) => {
        const listData = getListData(value);
        return (
            <ul className="events">
                {listData.map(item => (
                    <li key={item.content}>
                        <Badge status={item.type} text={item.content} />
                    </li>
                ))}
            </ul>
        );
    }, [getListData])

    const getMonthData = useCallback((value: moment.Moment) => {
        if (monthTotal.has(value.format('YYYY-MM'))) {
            return monthTotal.get(value.format('YYYY-MM'));
        }
        return 0;
    }, [monthTotal])

    const monthCellRender = useCallback((value: moment.Moment) => {
        const num = getMonthData(value);
        return num ? (
            <div className="notes-month">
                <section>{num}</section>
                <span>记录日报次数</span>
            </div>
        ) : null;
    }, [getMonthData])

    return (
        <Calendar dateCellRender={dateCellRender} monthCellRender={monthCellRender} />
    )
}

export default Home;