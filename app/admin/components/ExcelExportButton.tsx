'use client';

import * as XLSX from 'xlsx';
import Button from "@/components/buttons/Button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { COMMUNITY_STATUSES } from "@/lib/constants";
import { showThankYouToast } from '@/lib/utils/toast-utils';

interface ExcelExportButtonProps {
  data: any[]; 
  fileName?: string;
  exportType: 'group' | 'workshop'; // To determine filtering logic and messages
}

export default function ExcelExportButton({ data, fileName = 'participants', exportType }: ExcelExportButtonProps) {

  const handleExcelExport = () => {
    // Filter data based on type
    let dataToExport = data;

    if (exportType === 'group') {
        // For groups, we only want approved participants
        dataToExport = data.filter(item => item.status === 'approved');
    }

    // Check if there is data after filtering
    if (!dataToExport || dataToExport.length === 0) {
        const errorMsg = exportType === 'group' 
            ? "אין משתתפים שאושרו לייצוא" 
            : "אין נתונים לייצוא";
        toast.error(errorMsg);
        return;
    }

    // Format data for Excel
    const formattedData = dataToExport.map(item => {
        const user = item.users;
        
        if (!user) return {};

        // Community status
        const rawStatuses = Array.isArray(user.community_status) ? user.community_status : [user.community_status];
        const translatedCommunityStatus = rawStatuses.map((val: string) => {
            const statusObj = COMMUNITY_STATUSES.find(s => s.value === val);
            return statusObj ? statusObj.label : val;
        }).join(', ');

        return {
            'שם פרטי': user.first_name,
            'שם משפחה': user.last_name,
            'טלפון': user.phone_number,
            'אימייל': user.email,
            'סטטוס קהילתי': translatedCommunityStatus,
            'הערות': item.comment || '-',
        };
    });

    // Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Set Sheet View to RTL
    worksheet['!views'] = [{ rightToLeft: true }];

    // Create Workbook and Append Sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "רשימת משתתפים");

    // Sets the Workbook view properties to RTL
    if(!workbook.Workbook) workbook.Workbook = {};
    workbook.Workbook.Views = [{ RTL: true }];

    // Download File
    XLSX.writeFile(workbook, `${fileName}.xlsx`);

    // Success Notification
    const successMsg = exportType === 'group'
        ? "רשימת המשתתפים שאושרו יוצאה בהצלחה לאקסל"
        : "רשימת המשתתפים יוצאה בהצלחה לאקסל";
    
    showThankYouToast({ message: successMsg});
  };

  return (
    <button 
      className='add-new-button'
      onClick={handleExcelExport}
    >
      ייצוא לאקסל
      <Download size={16} />
    </button>
  );
}