"use client";
import {
  ArrowsAltOutlined,
  FileExcelOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import type { PaginationProps, RadioChangeEvent } from "antd";
import {
  Card,
  Divider,
  Empty,
  Input,
  Layout,
  Radio,
  Result,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { Avatar, List } from "antd";
import { Button, Modal } from "antd";
import { Spin } from "antd";
import useAbortableFetch from "./hooks/useAbortableFetch";
import type { SearchProps } from "antd/es/input";
import ExcelJS from "exceljs";
import { useRouter } from "next/navigation";
import axios from "axios";

const { Paragraph } = Typography;
const { Header } = Layout;

interface Characters {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
}

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [urlRnM, setUrlRnM] = useState('/api/rnmapi');
  const [searchByValue, setSearchByValue] = useState("name");
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [count, setCount] = useState(0);
  const [currentItemId, setCurrentItemId] = useState(0);
  const [characters, setCharacters] = useState<Characters[]>([]);
  const { data, error, isLoading, setUrl } = useAbortableFetch();
  const { Search } = Input;

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  const router = useRouter();
  const logout = async () => {
    try {
      const res = await axios.get("/api/auth/logout");
      console.log(res);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err)
      } else {
        console.error('An unknown error occurred.');
      }
    }
    router.push("/login");
  };

  const onSearch: SearchProps["onSearch"] = (value, _e, info) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const onChange: PaginationProps["onChange"] = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setUrl("/api/rnmapi");
  }, []);

  useEffect(() => {
    if (searchValue !== "") {
      const searchQuery = `&${searchByValue}=${searchValue}`;
      setUrl(`/api/rnmapi?page=${currentPage}${searchQuery}`);
      return;
    }
    setUrl(`/api/rnmapi?page=${currentPage}`);
  }, [currentPage, searchByValue, searchValue, setUrl]);

  useEffect(() => {
    // Cuando los datos cambian, actualiza el estado 'characters'
    if (data && data.results) {
      setCharacters(data.results);
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      if (count !== data.info.count) setCount(data.info.count);
      return;
    }
    if (data && data.error) {
    }
  }, [count, data]);

  const showModal = (id: number) => {
    setCurrentItemId(id);
    setIsModalOpen(true);
  };

  const afterCloseModal = () => {
    setCurrentItemId(0);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onChangeRadioSearch = (e: RadioChangeEvent) => {
    setSearchByValue(e.target.value);
  };

  const downloadExcel = async () => {
    function transformArray(
      inputArray: Characters[],
      elementsToReturn: string[]
    ): (string | number)[][] {
      if (inputArray.length === 0) {
        return [];
      }

      const newArray: (string | number)[][] = [elementsToReturn]; // Usamos los elementos a retornar como encabezados

      inputArray.forEach((obj) => {
        const row: (string | number)[] = elementsToReturn.map(
          (element) => obj[element]
        );
        newArray.push(row);
      });

      return newArray;
    }
    const elementsToReturn: string[] = ["name", "species", "image"];
    const dataToExport = transformArray(characters, elementsToReturn);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Datos");

    // Agrega datos a la hoja de cálculo
    dataToExport.forEach((row) => {
      worksheet.addRow(row);
    });

    // Crea un archivo blob
    const buffer = await workbook.xlsx.writeBuffer();

    // Crea un objeto Blob y un enlace para la descarga
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);

    // Crea un enlace y simula un clic para descargar el archivo
    const a = document.createElement("a");
    a.href = url;
    a.download = "RickAndMortyCharacters.xlsx"; // Nombre del archivo Excel
    a.click();

    // Revoca la URL del objeto Blob
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', backgroundColor: '#fff' }}>
        <Button onClick={() => logout()}>Logout</Button>
      </Header>
      <Card
        title="Rick and Morty Characters"
        headStyle={{ fontSize: "2rem" }}
        style={{ width: "96%", margin: "1rem auto 3rem" }}
      >
        {characters.length === 0 ? (
          <Spin indicator={antIcon} />
        ) : (
          <>
            <Modal
              cancelText="Cerrar"
              title={characters[currentItemId]?.name}
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
              afterClose={afterCloseModal}
            >
              <Avatar
                shape="square"
                size={128}
                src={characters[currentItemId]?.image}
              />
              <Divider />
              <Paragraph>
                <strong>Status:</strong> {characters[currentItemId]?.status}
              </Paragraph>
              <Paragraph>
                <strong>Species:</strong> {characters[currentItemId]?.species}
              </Paragraph>
              <Paragraph>
                <strong>Type:</strong>{" "}
                {characters[currentItemId]?.type
                  ? characters[currentItemId]?.type
                  : "N/A"}
              </Paragraph>
              <Paragraph>
                <strong>Gender:</strong>{" "}
                {characters[currentItemId]?.gender
                  ? characters[currentItemId]?.gender
                  : "N/A"}
              </Paragraph>
              <Paragraph>
                <strong>Origin:</strong>{" "}
                {characters[currentItemId]?.origin.name}
              </Paragraph>
              <Paragraph>
                <strong>Location:</strong>{" "}
                {characters[currentItemId]?.location.name}
              </Paragraph>
            </Modal>
            <Space wrap>
              <Paragraph style={{ margin: 0 }}>Search by: </Paragraph>
              <Radio.Group onChange={onChangeRadioSearch} value={searchByValue}>
                <Radio value="name">Name</Radio>
                <Radio value="species">Species</Radio>
              </Radio.Group>
              <Search
                placeholder="Search by name or species"
                onSearch={onSearch}
                style={{ width: 280 }}
              />
              <Button onClick={downloadExcel}>
                Download Excel <FileExcelOutlined />
              </Button>
            </Space>
            <Divider />
            {error ? (
              <Empty style={{ margin: "5rem auto" }} />
            ) : (
              <Spin
                spinning={isLoading || data?.error !== undefined}
                size="large"
                indicator={antIcon}
              >
                <List
                  itemLayout="horizontal"
                  size="large"
                  pagination={{
                    onChange: onChange,
                    pageSize: 20,
                    total: count,
                    showSizeChanger: false,
                    pageSizeOptions: [20],
                    current: currentPage,
                  }}
                  dataSource={characters}
                  renderItem={(item, index) => (
                    <List.Item
                      key={item.id}
                      actions={[
                        isLoading ? (
                          <Skeleton.Button size="large" active />
                        ) : (
                          <Button
                            key={item.id}
                            type="primary"
                            onClick={() => {
                              showModal(index);
                            }}
                          >
                            View details <ArrowsAltOutlined />
                          </Button>
                        ),
                      ]}
                    >
                      <Skeleton avatar loading={isLoading} active>
                        <List.Item.Meta
                          avatar={<Avatar src={item.image} />}
                          title={item.name}
                          description={item.species}
                        />
                      </Skeleton>
                    </List.Item>
                  )}
                />
              </Spin>
            )}
          </>
        )}
      </Card>
    </Layout>
  );
}
