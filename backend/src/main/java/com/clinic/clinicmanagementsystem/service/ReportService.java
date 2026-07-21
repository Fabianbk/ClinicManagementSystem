package com.clinic.clinicmanagementsystem.service;

import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Compiles .jrxml templates from the classpath once and caches the compiled
 * JasperReport in memory, since compiling XML -> .jasper on every request
 * would be wasteful. Fill + export happen per-request since those depend on
 * the actual data being printed.
 */
@Service
public class ReportService {

    private final Map<String, JasperReport> compiledReports = new ConcurrentHashMap<>();

    public byte[] generatePdf(String templateName, Map<String, Object> parameters,
                              List<?> detailRows) {
        try {
            JasperReport report = getCompiledReport(templateName);

            JRBeanCollectionDataSource dataSource =
                    new JRBeanCollectionDataSource(detailRows != null ? detailRows : List.of());

            JasperPrint jasperPrint = JasperFillManager.fillReport(report, parameters, dataSource);
            return JasperExportManager.exportReportToPdf(jasperPrint);
        } catch (JRException e) {
            throw new IllegalStateException("Failed to generate PDF report: " + templateName, e);
        }
    }

    private JasperReport getCompiledReport(String templateName) {
        return compiledReports.computeIfAbsent(templateName, this::compileFromClasspath);
    }

    private JasperReport compileFromClasspath(String templateName) {
        String path = "/reports/" + templateName + ".jrxml";
        try (InputStream is = getClass().getResourceAsStream(path)) {
            if (is == null) {
                throw new IllegalStateException("Report template not found: " + path);
            }
            return JasperCompileManager.compileReport(is);
        } catch (JRException | java.io.IOException e) {
            throw new IllegalStateException("Failed to compile report template: " + path, e);
        }
    }
}