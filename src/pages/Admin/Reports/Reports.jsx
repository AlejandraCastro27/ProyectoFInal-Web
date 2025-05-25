import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Layout from '../../../components/ui/Layout';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack
} from '@mui/material';

const Reports = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const querySnapshot = await getDocs(collection(db, "projects"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const estados = ["formulacion", "evaluacion", "activo", "inactivo", "finalizado"];
  const estadosCount = estados.map(
    estado => projects.filter(p => p.estado === estado).length
  );

  const chartData = {
    labels: estados,
    datasets: [
      {
        label: "Proyectos por estado",
        data: estadosCount,
        backgroundColor: "#7768FF",
      },
    ],
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Proyectos", 14, 20);
    doc.setFontSize(12);
    doc.text(`Total de proyectos: ${projects.length}`, 14, 30);
    const tableData = projects.map((p, index) => [
      index + 1,
      p.titulo,
      p.area,
      p.estado,
      p.institucion,
      p.presupuesto?.toLocaleString("es-CO", {
        style: "currency",
        currency: "COP",
      }) ?? "N/A",
    ]);
    autoTable(doc, {
      startY: 40,
      head: [["#", "Título", "Área", "Estado", "Institución", "Presupuesto"]],
      body: tableData,
    });
    doc.save("reporte_proyectos.pdf");
  };

  return (
    <Layout>
      <Box sx={{ width: '100%', p: { xs: 1, md: 3 } }}>
        <Paper elevation={3} sx={{ width: '100%', maxWidth: 900, mx: 'auto', p: { xs: 2, md: 4 }, borderRadius: 4, boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
            <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700, fontFamily: 'Baloo 2' }}>
              Visualización de Reportes
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate("/dashboard")}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              ← Volver al Dashboard
            </Button>
          </Box>
          <Box sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            <Bar data={chartData} />
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={generatePDF}
            sx={{ mb: 4, fontWeight: 700, fontFamily: 'Baloo 2', borderRadius: 2 }}
            startIcon={<span role="img" aria-label="pdf">📄</span>}
          >
            Generar PDF
          </Button>
          <Paper elevation={1} sx={{ p: 2, borderRadius: 3, background: '#F7F7F7' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 2, fontFamily: 'Baloo 2' }}>
              Listado de Proyectos
            </Typography>
            <List>
              {projects.map((p, i) => (
                <React.Fragment key={p.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 1 }}>
                    <ListItemText
                      primary={<span style={{ fontWeight: 600 }}>{i + 1}. {p.titulo}</span>}
                      secondary={
                        <Stack direction="column" spacing={0.5}>
                          <span><b>Área:</b> {p.area || 'No especificada'}</span>
                          <span><b>Estado:</b> <em>{p.estado}</em></span>
                          <span><b>Institución:</b> {p.institucion || 'No especificada'}</span>
                          <span><b>Presupuesto:</b> {p.presupuesto?.toLocaleString("es-CO", { style: "currency", currency: "COP" }) ?? "N/A"}</span>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {i < projects.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Reports;
