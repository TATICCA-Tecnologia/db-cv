import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { statusLabels, type CV } from "@/app/(app)/utils/cv"

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#0d9488",
    paddingBottom: 12,
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  meta: {
    fontSize: 9,
    color: "#444",
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
    color: "#0f766e",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
  },
  label: {
    width: 110,
    fontFamily: "Helvetica-Bold",
    color: "#555",
  },
  value: {
    flex: 1,
    color: "#222",
  },
  body: {
    lineHeight: 1.5,
    textAlign: "justify",
    color: "#333",
  },
  skillsText: {
    lineHeight: 1.4,
    color: "#333",
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    fontSize: 8,
    color: "#888",
    textAlign: "center",
  },
})

function safeFilenamePart(name: string): string {
  return name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 48)
}

export function buildCvPdfFilename(cv: CV): string {
  return `cv-${safeFilenamePart(cv.nome) || cv.id}.pdf`
}

export function CvPdfDocument({ cv }: { cv: CV }) {
  const submitted = new Date(cv.dataSubmissao).toLocaleDateString("pt-PT")

  return (
    <Document title={`CV — ${cv.nome}`} author={cv.nome} language="pt">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{cv.nome}</Text>
          <Text style={styles.meta}>{cv.email} · {cv.telefone}</Text>
          <Text style={styles.meta}>{cv.localizacao}</Text>
          <Text style={styles.meta}>
            Candidatura: {submitted} · {statusLabels[cv.status]}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Função pretendida</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Cargo</Text>
          <Text style={styles.value}>{cv.cargo}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Experiência</Text>
          <Text style={styles.value}>{cv.experiencia}</Text>
        </View>

        <Text style={styles.sectionTitle}>Competências</Text>
        <Text style={styles.skillsText}>
          {cv.skills.length > 0 ? cv.skills.join(" · ") : "—"}
        </Text>

        <Text style={styles.sectionTitle}>Resumo</Text>
        <Text style={styles.body}>{cv.resumo}</Text>

        <Text style={styles.footer} fixed>
          Gerado a partir dos dados do Banco CV · referência original: {cv.cvUrl}
        </Text>
      </Page>
    </Document>
  )
}
