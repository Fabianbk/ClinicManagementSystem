// Types mirror the Spring Boot DTOs/envelope exactly — keep these in sync
// with PatientResponseDTO / ApiResponse / PageResponse as the backend evolves.
interface PatientResponseDTO {
  patientId: number;
  fullname: string;
  gender: string;
  mobileNumber: string;
  email: string | null;
}

interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[] | null;
  timestamp: string;
}

async function getPatients(): Promise<ApiResponse<PageResponse<PatientResponseDTO>>> {
  const res = await fetch(`${process.env.API_BASE_URL}/patients?page=0&size=20`, {
    cache: 'no-store',
  });

  // GlobalExceptionHandler always returns a JSON ApiResponse body, even on
  // error — so we can parse it first and use its message either way.
  const body: ApiResponse<PageResponse<PatientResponseDTO>> = await res.json();

  if (!res.ok) {
    throw new Error(body.message ?? `Request failed with status ${res.status}`);
  }

  return body;
}

export default async function HomePage() {
  let result: ApiResponse<PageResponse<PatientResponseDTO>> | null = null;
  let errorMessage: string | null = null;

  try {
    result = await getPatients();
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Unknown error';
  }

  return (
    <main>
      <h1>Patients</h1>

      {errorMessage && (
        <p className="error">
          Could not reach the API: {errorMessage}. Make sure Spring Boot is
          running on port 8080.
        </p>
      )}

      {result?.success && result.data && (
        <>
          <p>{result.data.totalElements} patient(s) found.</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Mobile</th>
              </tr>
            </thead>
            <tbody>
              {result.data.content.map((patient) => (
                <tr key={patient.patientId}>
                  <td>{patient.patientId}</td>
                  <td>{patient.fullname}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.mobileNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </main>
  );
}
