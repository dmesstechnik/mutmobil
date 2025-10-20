import React, { useState, useEffect, useRef } from 'react'
export default function SideMenu() {
    const [isSideMenu, setSideMenu] = useState(false)
    const open = (isSideMenu) => {
        return setSideMenu(!isSideMenu)
    }
    const domeNode = useRef()
    const updateState = (event) => {
        if (domeNode.current.contains(event.target)) {
            return
        }
        setSideMenu(false)
    }
    useEffect(() => {
        document.addEventListener('mousedown', updateState)
        return () => {
            document.removeEventListener('mousedown', updateState)
        }
    }, [])
    return (
        <>
            <header className="topBar">
                <View className="menuBar">
                    <View
                        ref={domeNode}
                        className="navIcon"
                        onClick={() => {
                            open(isSideMenu)
                        }}
                    >
                    </View>
                </View>
                <View className="sideMenu" style={{ left: isSideMenu ? '0' : '-265px' }}>
                    
                </View>
            </header>
        </>
    )
}