import { FC, ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Badge } from 'antd';
import React from "react";
import "./index.css";
import { Link, useNavigate } from "react-router-dom";
import { IReport } from "../../../constant/typings";
const { ipcRenderer } = window.require("electron");

interface IListData {
    type: "warning" | "success" | "error" | "processing" | "default",
    content: string
}

const Home: FC = (): ReactElement => {
    const [response, setResponse] = useState<IReport[]>([]);
    const navigate = useNavigate();

    const getAllResponses = async () => {
        const response = await ipcRenderer.invoke("get", "/reports", localStorage.getItem("token"));
        if (response.code === 200) {
            setResponse(Object.values(response.result));
        } else if (response.code === 401) {
            localStorage.removeItem("token");
            ipcRenderer.send("goto login page");
            navigate("/login");
        }
    }

    useEffect(() => {
        getAllResponses();
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
            const eachDate = new Date(new Date(each.createdAt).getTime() + 8 * 60 * 60 * 1000).toJSON().substring(0, 10);
            if (eachDate === currentDate) {
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
        const report = response.filter(item =>
            new Date(new Date(item.createdAt).getTime() + 8 * 60 * 60 * 1000).toJSON().substring(0, 10) ===
            value.format('YYYY-MM-DD')
        )[0];
        return (
            <ul className="events">
                {listData.map(item => (
                    <li key={item.type + item.content}>
                        <Link to={{ pathname: "/frame/detail" }} state={{ ...report, username: localStorage.getItem("username") }}>
                            <Badge status={item.type} text={item.content} />
                        </Link>
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
                <span>??????????????????</span>
            </div>
        ) : null;
    }, [getMonthData])

    return (
        <Calendar dateCellRender={dateCellRender} monthCellRender={monthCellRender} />
    )
}

export default Home;