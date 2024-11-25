import React from "react";
import { useBackend } from "main/utils/useBackend";
import StudentsTable from "main/components/Students/StudentsTable";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Button, Row, Col } from "react-bootstrap";
import { useCurrentUser} from "main/utils/currentUser";

export default function StudentsIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: students,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/Students/all"],
    { method: "GET", url: "/api/Students/all" },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        <Row className="pt-5">
          <Col>
            <h2>Students</h2>
          </Col>
          <Row>
            <StudentsTable students={students} currentUser={currentUser} />
          </Row>
          <Col>
            <Button variant="primary" href={`/admin/Students/create`}>
              Create Student
            </Button>
          </Col>
        </Row>
      </div>
    </BasicLayout>
  )
}