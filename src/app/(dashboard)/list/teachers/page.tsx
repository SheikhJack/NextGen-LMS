import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, SortAsc, Plus, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { getUserRole } from "@/lib/getUserRole";
import { ITEM_PER_PAGE } from "@/lib/settings";

type TeacherList = Teacher & { subjects: Subject[] } & { classes: Class[] };

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) => {

  const params = await searchParams;
  const { sessionClaims } = await auth();
  const role = await getUserRole();
  
  const { page, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: parseInt(value),
              },
            };
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-bold">All Teachers</CardTitle>
        <div className="flex items-center gap-2">
          <TableSearch />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <SortAsc className="h-4 w-4" />
          </Button>
          {role === "admin" && (
            <FormContainer table="teacher" type="create" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-sm font-medium text-gray-600">Info</TableHead>
              <TableHead className="hidden md:table-cell">Teacher ID</TableHead>
              <TableHead className="hidden md:table-cell">Subjects</TableHead>
              <TableHead className="hidden md:table-cell">Classes</TableHead>
              <TableHead className="hidden lg:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Address</TableHead>
              {role === "admin" && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((teacher) => (
              <TableRow key={teacher.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Avatar className="hidden md:block">
                      <AvatarImage src={teacher.img || "/noAvatar.png"} />
                      <AvatarFallback>
                        {teacher.name?.[0]}{teacher.surname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold">{teacher.name} {teacher.surname}</span>
                      <span className="text-sm text-muted-foreground">{teacher.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{teacher.username}</TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject) => (
                      <Badge key={subject.id} variant="secondary">
                        {subject.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {teacher.classes.map((classItem) => (
                      <Badge key={classItem.id} variant="outline">
                        {classItem.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">{teacher.phone}</TableCell>
                <TableCell className="hidden lg:table-cell">{teacher.address}</TableCell>
                {role === "admin" && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/list/teachers/${teacher.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <FormContainer table="teacher" type="delete" id={teacher.id} />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination page={p} count={count}  />
      </CardContent>
    </Card>
  );
};

export default TeacherListPage;